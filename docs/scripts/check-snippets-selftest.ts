/**
 * Guards the docs snippet linter against silently going blind.
 *
 * `__fixtures__/regressions.mdx` contains one example of every defect the
 * linter is supposed to catch — the real bugs that shipped in the v3 docs.
 * If a refactor makes any rule stop firing, this fails.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Each rule must be triggered by at least one fixture snippet. */
const EXPECTED_RULES = [
	"slot-syntax",
	"import-path",
	"missing-import",
	"unknown-class",
];

const result = spawnSync(
	process.execPath,
	[path.join(HERE, "check-snippets.ts"), path.join(HERE, "__fixtures__")],
	{ encoding: "utf8" },
);

const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

if (result.status === 0) {
	console.error(
		"✗ self-test: the linter reported no problems for the regression fixtures.\n" +
			"  Every rule has stopped firing — the docs check is not protecting anything.",
	);
	console.error(output);
	process.exit(1);
}

const missing = EXPECTED_RULES.filter((rule) => !output.includes(`[${rule}]`));

if (missing.length > 0) {
	console.error(
		`✗ self-test: these rules no longer fire on the regression fixtures: ${missing.join(", ")}`,
	);
	console.error(output);
	process.exit(1);
}

console.log(
	`✓ self-test: all ${EXPECTED_RULES.length} rule groups still catch their regressions`,
);
