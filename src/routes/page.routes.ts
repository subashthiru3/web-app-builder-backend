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
 *     responses:
 *       200:
 *         description: Page saved successfully
 */
router.post("/save", savePage);

/**
 * @swagger
 * /api/pages/{projectName}:
 *   get:
 *     summary: Get latest page JSON
 *     tags: [Pages]
 *     parameters:
 *       - in: path
 *         name: projectName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest page JSON
 *       404:
 *         description: Page not found
 */
router.get("/:projectName", getLatestPage);

export default router;
