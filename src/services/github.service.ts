import axios from "axios";

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN!;

export const commitPageJson = async (projectName: string, pageJson: any) => {
  const filePath = `runtime/${projectName}/page.json`;

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

  let sha: string | undefined = undefined;

  // ✅ STEP 1 — Check if file exists
  try {
    const existingFile = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
      params: { ref: branch },
    });

    sha = existingFile.data.sha;
  } catch (err: any) {
    if (err.response?.status !== 404) {
      throw err;
    }
  }

  // ✅ STEP 2 — Commit file (Create OR Update)
  await axios.put(
    url,
    {
      message: `Deploy ${projectName}`,
      content: Buffer.from(JSON.stringify(pageJson, null, 2)).toString(
        "base64",
      ),
      branch,
      ...(sha && { sha }), // ⭐ IMPORTANT
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
};
