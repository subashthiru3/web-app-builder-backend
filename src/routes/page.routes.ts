import { Router } from "express";
import { savePage, getLatestPage } from "../controllers/page.controller";

const router = Router();

/**
 * @swagger
 * /api/pages/save:
 *   post:
 *     summary: Save or update a page JSON
 *     tags: [Pages]
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
 *                 example: Marketing landing page
 *               stage:
 *                 type: string
 *                 enum: [dev, test, uat, prod]
 *                 example: prod
 *     responses:
 *       200:
 *         description: Page saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Page saved successfully
 */
router.post("/save", savePage);

/**
 * @swagger
 * /api/pages:
 *   get:
 *     summary: Get latest page JSON
 *     tags: [Pages]
 *     parameters:
 *       - in: query
 *         name: project
 *         required: true
 *         schema:
 *           type: string
 *         example: my-project
 *       - in: query
 *         name: stage
 *         required: true
 *         schema:
 *           type: string
 *           enum: [dev, test, uat, prod]
 *         example: prod
 *     responses:
 *       200:
 *         description: Latest page JSON
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties: true
 *       400:
 *         description: project and stage are required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: project and stage are required
 *       404:
 *         description: Page not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No page found
 *       500:
 *         description: Invalid JSON format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid JSON format
 */
router.get("/", getLatestPage);

export default router;
