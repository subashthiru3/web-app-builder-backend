import { Router } from "express";
import { getDeploymentStatus } from "../controllers/azure.deployment.status.controller";

const router = Router();

/**
 * @swagger
 * /api/azure/deployments/{id}/status:
 *   get:
 *     summary: Get Azure deployment status by deployment ID
 *     tags:
 *       - Azure Deployments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Deployment ID
 *         example: 67bff7f9e1a2ab12cd34ef56
 *     responses:
 *       200:
 *         description: Deployment status fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [IN_PROGRESS, SUCCESS, FAILED]
 *                   example: IN_PROGRESS
 *       404:
 *         description: Deployment not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deployment not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Request failed with status code 401
 */
router.get("/:id/status", getDeploymentStatus);

export default router;
