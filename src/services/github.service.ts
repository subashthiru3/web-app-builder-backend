import axios from "axios";

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || "main";
const token = process.env.GITHUB_TOKEN!;
const workflowId = process.env.GITHUB_WORKFLOW!;

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

export async function getLatestWorkflowRun(
  targetWorkflowId: string = workflowId,
) {
  const { data } = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${targetWorkflowId}/runs?per_page=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  return data.workflow_runs[0];
}

type WaitForWorkflowRunOptions = {
  targetWorkflowId: string;
  branch: string;
  previousRunId?: number;
  dispatchedAt: Date;
  attempts?: number;
  intervalMs?: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForWorkflowRun(options: WaitForWorkflowRunOptions) {
  const {
    targetWorkflowId,
    branch,
    previousRunId,
    dispatchedAt,
    attempts = 12,
    intervalMs = 2000,
  } = options;

  const dispatchTimeMs = dispatchedAt.getTime() - 2000;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const { data } = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${targetWorkflowId}/runs?per_page=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    const matchingRun = (data.workflow_runs || []).find((run: any) => {
      if (run.id === previousRunId) {
        return false;
      }

      const createdAtMs = new Date(run.created_at).getTime();

      return (
        run.event === "workflow_dispatch" &&
        run.head_branch === branch &&
        createdAtMs >= dispatchTimeMs
      );
    });

    if (matchingRun) {
      return matchingRun;
    }

    await sleep(intervalMs);
  }

  return null;
}
