import axios from "axios";

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const token = process.env.GITHUB_TOKEN!;

export async function getLatestWorkflowStatus() {
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=1`;

  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  const run = res.data.workflow_runs[0];

  return {
    status: run.status, // queued | in_progress | completed
    conclusion: run.conclusion, // success | failure
    html_url: run.html_url,
  };
}
