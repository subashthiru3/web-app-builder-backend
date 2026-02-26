import { Request, Response } from "express";
import axios from "axios";
import sodium from "libsodium-wrappers";

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;
const SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID!;

const GITHUB_PAT = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_WORKFLOW_ID = process.env.GITHUB_WORKFLOW!;

async function getAzureToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("scope", "https://management.azure.com/.default");

  const response = await axios.post(url, params);
  return response.data.access_token;
}

async function createGitHubSecret(secretName: string, secretValue: string) {
  await sodium.ready;

  // 1️⃣ Get GitHub repo public key
  const { data: publicKeyData } = await axios.get(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/secrets/public-key`,
    {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  const publicKey = publicKeyData.key;
  const keyId = publicKeyData.key_id;

  // 2️⃣ Convert values to Uint8Array
  const messageBytes = sodium.from_string(secretValue);
  const publicKeyBytes = sodium.from_base64(
    publicKey,
    sodium.base64_variants.ORIGINAL,
  );

  // 3️⃣ Encrypt using sealed box (GitHub required method)
  const encryptedBytes = sodium.crypto_box_seal(messageBytes, publicKeyBytes);

  const encryptedValue = sodium.to_base64(
    encryptedBytes,
    sodium.base64_variants.ORIGINAL,
  );

  // 4️⃣ Upload encrypted secret to GitHub
  await axios.put(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/secrets/${secretName}`,
    {
      encrypted_value: encryptedValue,
      key_id: keyId,
    },
    {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
}

async function triggerWorkflow(staticWebAppName: string, secretName: string) {
  await axios.post(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${GITHUB_WORKFLOW_ID}/dispatches`,
    {
      ref: "main",
      inputs: {
        project: staticWebAppName,
        token_name: secretName,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${GITHUB_PAT}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
}

export async function createStaticWebApp(req: Request, res: Response) {
  const { appName, resourceGroup, location, sku } = req.body;

  try {
    const token = await getAzureToken();
    const sanitizedAppName = appName.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const staticWebAppName = `${sanitizedAppName}-${Date.now()}`;

    // 1️⃣ Create Static Web App
    const createUrl = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/staticSites/${appName}?api-version=2022-03-01`;

    await axios.put(
      createUrl,
      {
        location: location || "centralus",
        sku: { name: sku || "Free" },
        properties: {
          // repositoryUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`,
          // branch: "main",
          // buildProperties: {
          //   appLocation: "/",
          //   outputLocation: "out",
          // },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    // 2️⃣ Get Deployment Token
    const secretsUrl = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/staticSites/${appName}/listSecrets?api-version=2022-03-01`;

    const { data: secretsData } = await axios.post(
      secretsUrl,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const deploymentToken = secretsData.properties.apiKey;
    const secretName = `SWA_TOKEN_${staticWebAppName}`
      .toUpperCase()
      .replace(/-/g, "_");

    // 3️⃣ Update GitHub Secret
    await createGitHubSecret(secretName, deploymentToken);

    // 4️⃣ Trigger Workflow
    await triggerWorkflow(staticWebAppName, secretName);

    res.status(200).json({
      message: "Static Web App created and deployment triggered 🚀",
    });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
}
