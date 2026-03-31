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
 *                 description: Preferred deployment selector from UI dropdown
 *               appName:
 *                 type: string
 *                 example: my-static-app
 *                 description: Optional fallback when stage mapping is not configured
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
 *                   example: dev
 *                 appName:
 *                   type: string
 *                   example: my-static-app-dev
 *                 azureStaticUrl:
 *                   type: string
 *                   example: https://my-static-app-dev.azurestaticapps.net
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
