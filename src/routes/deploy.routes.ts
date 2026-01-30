import { Router } from "express";
import { deploy } from "../controllers/deploy.controller";

const router = Router();

/**
 * @swagger
 * /api/deploy:
 *   post:
 *     summary: Deploy latest page configuration
 *     tags: [Deploy]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: my-project
 *     responses:
 *       200:
 *         description: Deployment triggered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: DEPLOY_TRIGGERED
 *                 liveUrl:
 *                   type: string
 *                   example: https://app.azurestaticapps.net
 *       404:
 *         description: No page found
 */
router.post("/", deploy);

export default router;
