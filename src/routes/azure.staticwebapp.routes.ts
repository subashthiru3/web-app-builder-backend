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
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Static Web App created successfully
 *                 appName:
 *                   type: string
 *                   example: my-static-app
 *                 resourceGroup:
 *                   type: string
 *                   example: my-resource-group
 *                 staticUrl:
 *                   type: string
 *                   nullable: true
 *                   example: https://my-static-app.azurestaticapps.net
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
 *     summary: Trigger Static Web App deployment workflow by stage and get URL
 *     tags:
 *       - Azure Static Web App
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stage:
 *                 type: string
 *                 enum: [dev, test, uat, prod]
 *                 example: dev
 *               appName:
 *                 type: string
 *                 example: my-static-app
 *                 description: Base app name used to resolve the stage-specific app name
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
 *                 stage:
 *                   type: string
 *                   nullable: true
 *                   example: prod
 *                 appName:
 *                   type: string
 *                   example: my-static-app
 *                 azureStaticUrl:
 *                   type: string
 *                   example: https://my-static-app.azurestaticapps.net
 *                 pollStatusPath:
 *                   type: string
 *                   example: /api/azure/deployments/123e4567-e89b-12d3-a456-426614174000/status
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid stage. Supported values: dev, test, uat, prod"
 *       404:
 *         description: Static Web App not found
 *       500:
 *         description: Error triggering deployment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Workflow triggered, but failed to identify workflow run
 */
router.post("/", createStaticWebApp);
router.post("/deploy", triggerStaticWebAppDeploy);

export default router;
