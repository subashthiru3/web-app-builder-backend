import { Request, Response } from "express";
import axios from "axios";

// You need to set these values from your Azure AD app registration
const TENANT_ID = process.env.AZURE_TENANT_ID;
const CLIENT_ID = process.env.AZURE_CLIENT_ID;
const CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
const SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID;

// Helper to get Azure access token
async function getAzureToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID!);
  params.append("client_secret", CLIENT_SECRET!);
  params.append("scope", "https://management.azure.com/.default");
  try {
    const response = await axios.post(url, params);
    return response.data.access_token;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(
        `Azure token error: ${JSON.stringify(error.response.data)}`,
      );
    } else {
      throw new Error(`Azure token error: ${error.message}`);
    }
  }
}

export async function createStaticWebApp(req: Request, res: Response) {
  const { appName, resourceGroup, location, sku } = req.body;
  try {
    const token = await getAzureToken();
    const url = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/staticSites/${appName}?api-version=2022-03-01`;
    const payload = {
      location: location || "centralus",
      sku: { name: sku || "Free" },
      properties: {
        repositoryUrl:
          "https://github.com/subashthiru3/web-app-builder-preview",
        branch: "main",
        repositoryToken: process.env.GITHUB_TOKEN,
      },
    };
    const response = await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    res.status(200).json(response.data);
  } catch (error: any) {
    console.log("eroor", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
}
