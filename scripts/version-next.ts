import { $ } from "bun";

const nextVersionBranch = "changeset-release/next" as const;

await $`bun changeset version`;

if (process.env.GITHUB_REF === nextVersionBranch) {
	await $`bun install`;
	await $`git add bun.lock && git commit -m "chore: update lock file" && git push origin ${nextVersionBranch}`;
}
