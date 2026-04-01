import axios from "axios";

const SUBSCRIPTION_ID = process.env.AZURE_SUBSCRIPTION_ID!;

export async function createStaticWebAppInternal(
  appName: string,
  resourceGroup: string,
  token: string,
  location: string = "centralus",
  sku: string = "Free",
) {
  const createUrl = `https://management.azure.com/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/staticSites/${appName}?api-version=2022-03-01`;

  const { data } = await axios.put(
    createUrl,
    {
      location,
      sku: { name: sku },
      properties: {},
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  const staticUrl = data.properties?.defaultHostname
    ? `https://${data.properties.defaultHostname}`
    : null;

  return {
    message: "Static Web App created successfully",
    appName,
    resourceGroup,
    staticUrl,
  };
}
