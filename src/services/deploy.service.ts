import { commitPageJson } from "./github.service";
import { triggerDeployWorkflow } from "./github.workflow";
import { savePage } from "./page.service";

export async function deployProject(projectName: string, pageJson: any) {
  // 1️⃣ Save to DB
  await savePage(projectName, pageJson);

  // 2️⃣ Commit JSON to GitHub repo
  await commitPageJson(projectName, pageJson);

  // 3️⃣ Trigger GitHub Actions Deploy
  await triggerDeployWorkflow(projectName);

  return {
    status: "deploy-triggered",
    project: projectName,
  };
}
