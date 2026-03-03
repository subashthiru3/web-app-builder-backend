import { Router } from "express";
import {
  createStaticWebApp,
  triggerStaticWebAppDeploy,
} from "../controllers/azure.staticwebapp.controller";

const router = Router();

/**
 * @swagger
 * /api/azure/staticwebapp:
 *   post:
 *     summary: Create a new Azure Static Web App (only creation)
 *     tags:
 *       - Azure Static Web App
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appName:
 *                 type: string
 *                 example: my-static-app
 *               resourceGroup:
 *                 type: string
 *                 example: my-resource-group
 *               location:
 *                 type: string
 *                 example: centralus
 *               sku:
 *                 type: string
 *                 example: Free
 *     responses:
 *       200:
 *         description: Azure Static Web App created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       500:
 *         description: Error creating Azure Static Web App
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 * /api/azure/staticwebapp/deploy:
 *   post:
 *     summary: Trigger Static Web App deployment workflow and get polling ID
 *     tags:
 *       - Azure Static Web App
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appName
 *             properties:
 *               appName:
 *                 type: string
 *                 example: my-static-app
 *                 description: Used to resolve workflow from server-side map
 *               resourceGroup:
 *                 type: string
 *                 example: my-resource-group
 *               branch:
 *                 type: string
 *                 example: main
 *     responses:
 *       200:
 *         description: Deployment triggered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deploymentId:
 *                   type: string
 *                 pollStatusPath:
 *                   type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Static Web App not found
 *       500:
 *         description: Error triggering deployment
 */
router.post("/", createStaticWebApp);
router.post("/deploy", triggerStaticWebAppDeploy);

export default router;
