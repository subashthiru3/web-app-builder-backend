import pool from "../config/db";

type DeploymentStatus = "IN_PROGRESS" | "SUCCESS" | "FAILED";

type CreateDeploymentInput = {
  id: string;
  projectName: string;
  stage: string;
  staticAppName: string;
  workflowRunId: string;
};

export async function createDeployment(data: CreateDeploymentInput) {
  const { id, projectName, stage, staticAppName, workflowRunId } = data;

  await pool.execute(
    `INSERT INTO deployment 
     (id, appName, stage, static_app_name, workflowRunId, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, projectName, stage, staticAppName, workflowRunId, "IN_PROGRESS"],
  );
}

export async function getDeploymentById(id: string) {
  const [rows]: any = await pool.execute(
    `SELECT * FROM deployment WHERE id = ?`,
    [id],
  );

  return rows?.[0] || null;
}

export async function updateDeploymentStatus(
  id: string,
  status: DeploymentStatus,
  url?: string,
) {
  if (url) {
    await pool.execute(
      `UPDATE deployment 
       SET status = ?, url = ?, updatedAt = NOW() 
       WHERE id = ?`,
      [status, url, id],
    );
  } else {
    await pool.execute(
      `UPDATE deployment 
       SET status = ?, updatedAt = NOW() 
       WHERE id = ?`,
      [status, id],
    );
  }
}

export async function getDeploymentByWorkflowRunId(workflowRunId: string) {
  const [rows]: any = await pool.execute(
    `SELECT * FROM deployment WHERE workflowRunId = ?`,
    [workflowRunId],
  );

  return rows?.[0] || null;
}

export async function listDeploymentsByProject(projectName: string) {
  const [rows]: any = await pool.execute(
    `SELECT * FROM deployment 
     WHERE appName = ? 
     ORDER BY createdAt DESC`,
    [projectName],
  );

  return rows;
}
