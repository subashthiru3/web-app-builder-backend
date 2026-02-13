import { Request, Response } from "express";
import { getLatestWorkflowStatus } from "../services/github.status";

export async function deployStatusController(req: Request, res: Response) {
  try {
    const result = await getLatestWorkflowStatus();

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch deploy status" });
  }
}
