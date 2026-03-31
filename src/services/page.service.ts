import pool from "../config/db";

export const savePage = async (
  projectName: string,
  pageJson: unknown,
  projectDescription?: string,
  stage: string = "prod",
): Promise<void> => {
  console.log("stage:", stage);
  await pool.execute(
    `INSERT INTO pages (project_name, project_description, page_json, stage)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       page_json = VALUES(page_json),
       project_description = VALUES(project_description),
       updated_at = CURRENT_TIMESTAMP`,
    [projectName, projectDescription || null, JSON.stringify(pageJson), stage],
  );
};

export const getLatestPage = async (
  projectName: string,
  stage: string = "prod",
): Promise<any | null> => {
  const [rows]: any = await pool.execute(
    `SELECT page_json FROM pages
     WHERE project_name = ? AND stage = ?
     ORDER BY updated_at DESC LIMIT 1`,
    [projectName, stage],
  );

  return rows.length ? rows[0].page_json : null;
};
