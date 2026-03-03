import { Request, Response } from "express";
import axios from "axios";
import sodium from "libsodium-wrappers";
import { v4 as uuidv4 } from "uuid";
import { createDeployment } from "../services/deployment.service";
import {
  getLatestWorkflowRun,
  waitForWorkflowRun,
} from "../services/github.service";

const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;
const SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID!;

const GITHUB_PAT = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_WORKFLOW_ID = process.env.GITHUB_WORKFLOW!;
const GITHUB_WORKFLOW_MAP = process.env.GITHUB_WORKFLOW_MAP;

function parseWorkflowMap(): Record<string, string> {
  if (!GITHUB_WORKFLOW_MAP) {
    return {};
  }

  try {
    const parsed = JSON.parse(GITHUB_WORKFLOW_MAP);

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const normalizedMap: Record<string, string> = {};

    Object.entries(parsed).forEach(([key, value]) => {
      if (typeof key === "string" && typeof value === "string") {
        normalizedMap[key] = value;
      }
    });

    return normalizedMap;
  } catch {
    return {};
  }
}

function resolveWorkflowIdByAppName(appName: string): string {
  const workflowMap = parseWorkflowMap();
  return workflowMap[appName] || GITHUB_WORKFLOW_ID;
}

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

async function triggerWorkflow(
  staticWebAppName: string,
  secretName: string,
  workflowId: string,
  branch: string,
) {
  await axios.post(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/${workflowId}/dispatches`,
    {
      ref: branch,
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

    const staticWebAppName = appName;

    // 1️⃣ Create Static Web App
    const createUrl = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/staticSites/${staticWebAppName}?api-version=2022-03-01`;

    const { data: createResponse } = await axios.put(
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

    const staticUrl = createResponse.properties?.defaultHostname
      ? `https://${createResponse.properties.defaultHostname}`
      : null;

    return res.status(200).json({
      message: "Static Web App created successfully",
      appName: staticWebAppName,
      resourceGroup,
      staticUrl,
    });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: error.message });
  }
}

async function getStaticWebAppResourceGroup(
  appName: string,
  token: string,
): Promise<string | null> {
  const listUrl = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/providers/Microsoft.Web/staticSites?api-version=2022-03-01`;

  const { data } = await axios.get(listUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const site = data?.value?.find((item: any) => item?.name === appName);

  if (!site?.id) {
    return null;
  }

  const idParts = String(site.id).split("/");
  const rgIndex = idParts.findIndex(
    (part: string) => part.toLowerCase() === "resourcegroups",
  );

  if (rgIndex === -1 || !idParts[rgIndex + 1]) {
    return null;
  }

  return idParts[rgIndex + 1];
}

export async function triggerStaticWebAppDeploy(req: Request, res: Response) {
  const { appName, resourceGroup, branch } = req.body;

  if (!appName) {
    return res.status(400).json({ error: "appName is required" });
  }

  try {
    const token = await getAzureToken();
    const selectedWorkflowId = resolveWorkflowIdByAppName(appName);

    const selectedBranch = branch || process.env.GITHUB_BRANCH || "main";
    const resolvedResourceGroup =
      resourceGroup || (await getStaticWebAppResourceGroup(appName, token));

    if (!resolvedResourceGroup) {
      return res.status(404).json({
        error:
          "Static Web App not found. Pass resourceGroup explicitly or verify appName.",
      });
    }

    // 2️⃣ Get Deployment Token
    const secretsUrl = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${resolvedResourceGroup}/providers/Microsoft.Web/staticSites/${appName}/listSecrets?api-version=2022-03-01`;

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
    const secretName = `SWA_TOKEN_${appName}`.toUpperCase().replace(/-/g, "_");

    // 3️⃣ Update GitHub Secret
    await createGitHubSecret(secretName, deploymentToken);

    // 4️⃣ Trigger workflow and fetch its exact run
    const previousRun = await getLatestWorkflowRun(selectedWorkflowId);
    const dispatchedAt = new Date();

    await triggerWorkflow(
      appName,
      secretName,
      selectedWorkflowId,
      selectedBranch,
    );

    const run = await waitForWorkflowRun({
      targetWorkflowId: selectedWorkflowId,
      branch: selectedBranch,
      previousRunId: previousRun?.id,
      dispatchedAt,
    });

    if (!run?.id) {
      return res.status(500).json({
        error: "Workflow triggered, but failed to identify workflow run",
      });
    }

    const deploymentId = uuidv4();

    // Save in DB
    await createDeployment(deploymentId, appName, run.id.toString());

    return res.status(200).json({
      message: "Deployment started 🚀",
      deploymentId,
      // pollStatusPath: `/api/azure/deployments/${deploymentId}/status`,
    });
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: error.message });
  }
}
