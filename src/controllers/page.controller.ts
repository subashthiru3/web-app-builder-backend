import { Request, Response } from "express";
import * as pageService from "../services/page.service";

export const savePage = async (req: Request, res: Response) => {
  const { projectName, pageJson } = req.body;

  await pageService.savePage(projectName, pageJson);
  res.json({ message: "Page saved successfully" });
};

export const getLatestPage = async (req: Request, res: Response) => {
  const { projectName } = req.params;

  const projectNameStr = Array.isArray(projectName)
    ? projectName[0]
    : projectName;
  const page = await pageService.getLatestPage(projectNameStr);

  // If page is a string, parse it; otherwise, return as is
  if (typeof page === "string") {
    try {
      res.json(JSON.parse(page));
    } catch (e) {
      res.status(500).json({ error: "Failed to parse page JSON" });
    }
  } else {
    res.json(page);
  }
};
