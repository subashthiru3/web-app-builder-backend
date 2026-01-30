import { Request, Response } from "express";
import { getLatestPage } from "../services/page.service";
import { commitPageJson } from "../services/github.service";

export const deploy = async (req: Request, res: Response) => {
  const { projectName } = req.body;

  const pageJson = await getLatestPage(projectName);
  if (!pageJson) {
    return res.status(404).json({ message: "No page found to deploy" });
  }

  await commitPageJson(pageJson);

  res.json({
    status: "DEPLOY_TRIGGERED",
    liveUrl: process.env.AZURE_STATIC_WEB_APP_URL,
  });
};
