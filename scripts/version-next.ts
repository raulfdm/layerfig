import { $ } from "bun";

// Update the version in package.json to the next version
await $`bun changeset version`;
// Update the lockfile to reflect the new version. Required to have the docs published correctly.
await $`bun install --lockfile-only`;
