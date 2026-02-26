import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import pageRoutes from "./routes/page.routes";
import deployRoutes from "./routes/deploy.routes";
import deployStatusRoutes from "./routes/deploy.status.routes";
import { swaggerSpec } from "./config/swagger";
import azureStaticWebAppRoutes from "./routes/azure.staticwebapp.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pages", pageRoutes);
app.use("/api/deploy", deployRoutes);
app.use("/api/deploy/status", deployStatusRoutes);
app.use("/api/azure/staticwebapp", azureStaticWebAppRoutes);

// 🔥 Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true }),
);

app.get("/health", (_, res) => res.send("OK"));

export default app;
