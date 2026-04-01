import express from "express";
import { deployStatusController } from "../controllers/github.status.controller";

const router = express.Router();

/**
 * @swagger
 * /api/deploy/status:
 *   get:
 *     summary: Get latest deployment workflow status
 *     tags: [Deploy]
 *     responses:
 *       200:
 *         description: Deployment status fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: in_progress
 *                 conclusion:
 *                   type: string
 *                   example: success
 *                   nullable: true
 *                 html_url:
 *                   type: string
 *                   example: https://github.com/run/123
 *       500:
 *         description: Failed to fetch deploy status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to fetch deploy status
 */
router.get("/", deployStatusController);

export default router;
