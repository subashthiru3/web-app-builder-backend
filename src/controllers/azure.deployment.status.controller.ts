import { Request, Response } from "express";
import axios from "axios";
import {
  getDeploymentById,
  updateDeploymentStatus,
} from "../services/deployment.service";

const GITHUB_PAT = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const TENANT_ID = process.env.AZURE_TENANT_ID!;
const CLIENT_ID = process.env.AZURE_CLIENT_ID!;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET!;
const SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID!;

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

async function getAzureStaticUrlByAppName(appName: string) {
  try {
    const token = await getAzureToken();

    const listUrl = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/providers/Microsoft.Web/staticSites?api-version=2022-03-01`;

    const { data } = await axios.get(listUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const matchedSite = data?.value?.find(
      (site: any) => site?.name === appName,
    );
    const hostname = matchedSite?.properties?.defaultHostname;

    return hostname ? `https://${hostname}` : null;
  } catch {
    return null;
  }
}

export async function getDeploymentStatus(req: Request, res: Response) {
  const { id } = req.params;

  try {
    const deployment = await getDeploymentById(String(id));

    if (!deployment) {
      return res.status(404).json({ message: "Deployment not found" });
    }

    const azureStaticUrl =
      (await getAzureStaticUrlByAppName(deployment.appName)) ||
      `https://${deployment.appName}.azurestaticapps.net`;

    // If already completed → return directly
    if (deployment.status !== "IN_PROGRESS") {
      return res.json({
        status: deployment.status,
        azureStaticUrl,
      });
    }

    // Fetch GitHub run status
    const { data } = await axios.get(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${deployment.workflowRunId}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_PAT}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    const ghStatus = data.status;
    const conclusion = data.conclusion;

    let finalStatus: "IN_PROGRESS" | "SUCCESS" | "FAILED" = "IN_PROGRESS";

    if (ghStatus === "completed") {
      finalStatus = conclusion === "success" ? "SUCCESS" : "FAILED";

      await updateDeploymentStatus(String(id), finalStatus);
    }

    return res.json({
      status: finalStatus,
      azureStaticUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
