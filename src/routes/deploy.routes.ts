import { Router } from "express";
import { deployController } from "../controllers/deploy.controller";

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
 *               - pageJson
 *             properties:
 *               projectName:
 *                 type: string
 *                 example: my-project
 *               pageJson:
 *                 type: object
 *                 example:
 *                   components: []
 *               projectDescription:
 *                 type: string
 *                 example: Landing page for product launch
 *               stage:
 *                 type: string
 *                 enum: [dev, test, uat, prod]
 *                 example: prod
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
 *                   example: deploy-triggered
 *                 project:
 *                   type: string
 *                   example: my-project
 *       400:
 *         description: projectName and pageJson required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: projectName and pageJson required
 *       500:
 *         description: Deploy failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deploy failed
 */
router.post("/", deployController);

export default router;
