import { Request, Response } from "express";
import * as pageService from "../services/page.service";

export const savePage = async (req: Request, res: Response) => {
  const { projectName, pageJson, projectDescription, stage } = req.body;

  await pageService.savePage(
    projectName,
    pageJson,
    projectDescription,
    stage || "prod",
  );

  res.json({ message: "Page saved successfully" });
};

export const getLatestPage = async (req: Request, res: Response) => {
  const { projectName } = req.params;
  const { stage } = req.query;

  const projectNameStr = Array.isArray(projectName)
    ? projectName[0]
    : projectName;

  const page = await pageService.getLatestPage(
    projectNameStr,
    (stage as string) || "prod",
  );

  if (typeof page === "string") {
    try {
      res.json(JSON.parse(page));
    } catch {
      res.status(500).json({ error: "Failed to parse page JSON" });
    }
  } else {
    res.json(page);
  }
};
