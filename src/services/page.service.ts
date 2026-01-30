import pool from "../config/db";

export const savePage = async (
  projectName: string,
  pageJson: unknown,
): Promise<void> => {
  await pool.execute(
    `INSERT INTO pages (project_name, page_json)
     VALUES (?, ?)
     ON DUPLICATE KEY UPDATE page_json = ?`,
    [projectName, JSON.stringify(pageJson), JSON.stringify(pageJson)],
  );
};

export const getLatestPage = async (
  projectName: string,
): Promise<any | null> => {
  const [rows]: any = await pool.execute(
    `SELECT page_json FROM pages
     WHERE project_name=?
     ORDER BY updated_at DESC LIMIT 1`,
    [projectName],
  );

  return rows.length ? rows[0].page_json : null;
};
