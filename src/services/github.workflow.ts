import axios from "axios";

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN!;
const workflow = process.env.GITHUB_WORKFLOW!;

export async function triggerDeployWorkflow(projectName: string) {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`;

  await axios.post(
    url,
    {
      ref: branch,
      inputs: {
        project: projectName,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    },
  );
}
