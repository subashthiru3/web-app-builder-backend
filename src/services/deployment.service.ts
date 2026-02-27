import pool from "../config/db";

export async function createDeployment(
  id: string,
  appName: string,
  workflowRunId: string,
) {
  await pool.execute(
    `INSERT INTO deployment (id, appName, workflowRunId, status)
     VALUES (?, ?, ?, 'IN_PROGRESS')`,
    [id, appName, workflowRunId],
  );
}

export async function getDeploymentById(id: string) {
  const [rows]: any = await pool.execute(
    `SELECT * FROM deployment WHERE id = ?`,
    [id],
  );

  return rows[0];
}

export async function updateDeploymentStatus(
  id: string,
  status: "SUCCESS" | "FAILED",
) {
  await pool.execute(`UPDATE deployment SET status = ? WHERE id = ?`, [
    status,
    id,
  ]);
}
