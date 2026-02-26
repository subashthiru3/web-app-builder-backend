import { Router } from "express";
import { createStaticWebApp } from "../controllers/azure.staticwebapp.controller";

const router = Router();

/**
 * @swagger
 * /api/azure/staticwebapp:
 *   post:
 *     summary: Create a new Azure Static Web App
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
 */
router.post("/", createStaticWebApp);

export default router;
