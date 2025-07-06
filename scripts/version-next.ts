import { $ } from "bun";

const nextVersionBranch = "changeset-release/next" as const;

await $`bun changeset version`;
await $`bun install`;
await $`git add bun.lock && git commit -m "chore: update lock file" && git push origin ${nextVersionBranch}`;
