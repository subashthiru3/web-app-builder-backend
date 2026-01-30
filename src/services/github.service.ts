import axios from "axios";

const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;

export const commitPageJson = async (pageJson: unknown): Promise<void> => {
  const path = "src/runtime/page.json";
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;

  let sha: string | undefined;

  try {
    const existing = await axios.get(url, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    });
    sha = existing.data.sha;
  } catch (_) {}

  const content = Buffer.from(JSON.stringify(pageJson, null, 2)).toString(
    "base64",
  );

  await axios.put(
    url,
    {
      message: "Deploy latest page config",
      content,
      sha,
      branch: GITHUB_BRANCH,
    },
    {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
    },
  );
};
