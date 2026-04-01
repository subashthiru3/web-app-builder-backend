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
  const { project, stage } = req.query;

  if (!project || !stage) {
    return res.status(400).json({
      error: "project and stage are required",
    });
  }

  const page = await pageService.getLatestPage(
    project as string,
    stage as string,
  );

  if (!page) {
    return res.status(404).json({ error: "No page found" });
  }

  if (typeof page === "string") {
    try {
      return res.json(JSON.parse(page));
    } catch {
      return res.status(500).json({ error: "Invalid JSON format" });
    }
  }

  res.json(page);
};
