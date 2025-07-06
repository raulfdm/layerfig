import { $ } from "bun";

const nextVersionBranch = "changeset-release/next" as const;

// By running versions PR, it'll create the versions, the branch and push all the changes
await $`bun changeset version`;

// ... now, we need to update the lock file so the pipelines and docs preview are deployable
await $`git checkout ${nextVersionBranch}`;
await $`bun install --lockfile-only`;
await $`git add bun.lock`;
await $`git commit -m "chore: update lock file"`;
await $`git push origin ${nextVersionBranch}"`;
