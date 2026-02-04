import { Request, Response } from "express";
import { deployProject } from "../services/deploy.service";

export async function deployController(req: Request, res: Response) {
  try {
    const { projectName, pageJson } = req.body;

    if (!projectName || !pageJson) {
      return res.status(400).json({
        message: "projectName and pageJson required",
      });
    }

    const result = await deployProject(projectName, pageJson);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Deploy failed",
    });
  }
}
