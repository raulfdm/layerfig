import { $ } from "bun";

// By running versions PR, it'll create the versions, the branch and push all the changes
await $`bun changeset version`;

// ... now, we need to update the lock file so the pipelines and docs preview are deployable
await $`bun install --lockfile-only`;
