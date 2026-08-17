/**
 * Lints the code samples embedded in the documentation.
 *
 * Docs snippets are fragments, so they cannot be type-checked as a whole
 * program — most of them reference a `schema` or a `config` that is defined
 * somewhere off-screen. Instead this checks the specific things that have
 * actually gone wrong in this repo:
 *
 *   1. slot-syntax   — v2 slot syntax (`$VAR`, `${A:-b}`) left in v3 docs
 *   2. import-path   — imports from a subpath the package doesn't export
 *   3. import-name   — imports of a symbol the package doesn't export
 *   4. missing-import — a Layerfig class used but never imported
 *   5. unknown-class — `new Foo()` where `Foo` is neither imported nor declared
 *
 * Run with `bun run check-docs` from the `docs` workspace.
 *
 * To intentionally show outdated or partial code (the migration guide does),
 * put a directive on the line before the fence:
 *
 *   {/* docs-lint-disable slot-syntax *\/}
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Defaults to the docs content; overridable so the rules can be tested. */
const DOCS_ROOT = process.argv[2]
	? path.resolve(process.argv[2])
	: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

/** The real public surface of the package, mirrored from `dist/*.d.ts`. */
const PACKAGE_EXPORTS: Record<string, readonly string[]> = {
	"@layerfig/config": [
		"ConfigBuilder",
		"ConfigBuilderOptions",
		"ConfigParser",
		"EnvironmentVariableSource",
		"FileSource",
		"ObjectSource",
		"z",
	],
	"@layerfig/config/client": [
		"ConfigBuilder",
		"ConfigBuilderOptions",
		"EnvironmentVariableSource",
		"ObjectSource",
		"z",
	],
	"@layerfig/config/zod": ["z"],
	"@layerfig/config/zod-mini": ["z"],
};

/** Layerfig classes that must be imported before they are instantiated. */
const LAYERFIG_CLASSES = [
	"ConfigBuilder",
	"ConfigParser",
	"EnvironmentVariableSource",
	"FileSource",
	"ObjectSource",
];

/** Globals a snippet may legitimately `new` without declaring them. */
const ALLOWED_GLOBAL_CLASSES = new Set([
	"Date",
	"Error",
	"Map",
	"Set",
	"URL",
	"URLSearchParams",
	"WeakMap",
	"WeakSet",
	"Intl",
	"RegExp",
	"Promise",
	"Response",
	"Request",
	"Headers",
	"TextEncoder",
	"TextDecoder",
]);

/** Fenced languages that hold configuration files rather than program code. */
const CONFIG_LANGS = new Set([
	"json",
	"jsonc",
	"json5",
	"yaml",
	"yml",
	"toml",
	"env",
]);

interface Snippet {
	file: string;
	line: number;
	lang: string;
	code: string;
	disabled: Set<string>;
}

interface Problem {
	file: string;
	line: number;
	rule: string;
	message: string;
}

const problems: Problem[] = [];

function report(s: Snippet, rule: string, message: string, offset = 0): void {
	if (s.disabled.has(rule)) return;
	problems.push({ file: s.file, line: s.line + offset, rule, message });
}

/* ------------------------------------------------------------------ */
/* Collecting snippets                                                 */
/* ------------------------------------------------------------------ */

function walk(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = path.join(dir, entry);
		if (statSync(full).isDirectory()) {
			out.push(...walk(full));
		} else if (/\.(mdx?|astro)$/.test(entry)) {
			out.push(full);
		}
	}
	return out;
}

const DISABLE_RE = /docs-lint-disable\s+([a-z- ]+)/;

/** Pulls ``` fenced blocks out of a Markdown/MDX file. */
function extractFences(file: string, source: string): Snippet[] {
	const lines = source.split("\n");
	const snippets: Snippet[] = [];
	let pendingDisable = new Set<string>();

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i] ?? "";

		const disableMatch = line.match(DISABLE_RE);
		if (disableMatch) {
			pendingDisable = new Set(disableMatch[1]?.trim().split(/\s+/) ?? []);
			continue;
		}

		const fence = line.match(/^\s*```+\s*([A-Za-z0-9_-]+)?/);
		if (!fence) continue;

		const lang = (fence[1] ?? "").toLowerCase();
		const body: string[] = [];
		let j = i + 1;
		for (; j < lines.length; j++) {
			if (/^\s*```+\s*$/.test(lines[j] ?? "")) break;
			body.push(lines[j] ?? "");
		}

		snippets.push({
			file,
			line: i + 1,
			lang,
			code: body.join("\n"),
			disabled: pendingDisable,
		});
		pendingDisable = new Set();
		i = j;
	}

	return snippets;
}

/**
 * `.astro` components build their samples as template literals. Any literal
 * mentioning ConfigBuilder is treated as a TypeScript snippet.
 */
function extractAstroTemplates(file: string, source: string): Snippet[] {
	const snippets: Snippet[] = [];
	const re = /`([^`]*)`/g;
	let match: RegExpExecArray | null;

	while (true) {
		match = re.exec(source);
		if (match === null) break;
		const code = match[1] ?? "";
		if (!code.includes("ConfigBuilder")) continue;
		snippets.push({
			file,
			line: source.slice(0, match.index).split("\n").length,
			lang: "ts",
			code,
			disabled: new Set(),
		});
	}

	return snippets;
}

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

/** Rule 1 — v2 slot syntax. */
function checkSlotSyntax(s: Snippet): void {
	const lines = s.code.split("\n");

	lines.forEach((line, idx) => {
		// A diff block's removal lines legitimately show the old syntax.
		if (s.lang === "diff" && line.trimStart().startsWith("-")) return;

		// `${VAR:-fallback}` — v2. The v3 form is `${VAR::-fallback}`.
		for (const m of line.matchAll(/\$\{[^}]*\}/g)) {
			const inner = m[0];
			if (/[^:]:-/.test(inner)) {
				report(
					s,
					"slot-syntax",
					`v2 fallback syntax ${inner} — v3 uses a double colon, e.g. ${inner.replace(/([^:]):-/, "$1::-")}`,
					idx + 1,
				);
			}
		}

		// A bare `$VAR` inside a configuration file is a v2 slot that will
		// silently never resolve. Program code uses `$` for other things, so
		// this only applies to config-shaped fences.
		if (CONFIG_LANGS.has(s.lang)) {
			for (const m of line.matchAll(/\$(?!\{)([A-Za-z_][A-Za-z0-9_]*)/g)) {
				report(
					s,
					"slot-syntax",
					`bare slot $${m[1]} — v3 requires braces: \${${m[1]}}`,
					idx + 1,
				);
			}
		}
	});
}

/**
 * A custom slot prefix still needs braces. The `slotPrefix` option and the
 * config that uses it are almost always in *separate* fences on the same page,
 * so this rule is scoped to the file rather than the snippet.
 */
function checkCustomPrefix(fileSnippets: Snippet[]): void {
	const prefixes = new Set<string>();
	for (const s of fileSnippets) {
		for (const m of s.code.matchAll(/slotPrefix:\s*["'`]([^"'`]+)["'`]/g)) {
			// The default `$` is already covered by the bare-slot rule, and is
			// too common in program code to match safely here.
			if (m[1] && m[1] !== "$") prefixes.add(m[1]);
		}
	}
	if (prefixes.size === 0) return;

	for (const s of fileSnippets) {
		for (const prefix of prefixes) {
			const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			const bare = new RegExp(`${escaped}(?!\\{)[A-Z][A-Z0-9_]*`, "g");
			for (const m of s.code.matchAll(bare)) {
				report(
					s,
					"slot-syntax",
					`"${m[0]}" uses slotPrefix "${prefix}" without braces — write ${prefix}{${m[0].slice(prefix.length)}}`,
					s.code.slice(0, m.index).split("\n").length,
				);
			}
		}
	}
}

/** Rules 2 and 3 — import paths and imported names. */
function checkImports(s: Snippet, imported: Set<string>): void {
	const re = /import\s+(type\s+)?\{([^}]*)\}\s+from\s+["']([^"']+)["']/g;

	for (const m of s.code.matchAll(re)) {
		const names = (m[2] ?? "")
			.split(",")
			.map(
				(n) =>
					n
						.trim()
						.replace(/^type\s+/, "")
						.split(/\s+as\s+/)[0],
			)
			.filter(Boolean) as string[];
		const source = m[3] ?? "";
		const offset = s.code.slice(0, m.index).split("\n").length;

		for (const n of names) imported.add(n);

		if (!source.startsWith("@layerfig/config")) continue;

		const allowed = PACKAGE_EXPORTS[source];
		if (!allowed) {
			report(
				s,
				"import-path",
				`"${source}" is not an entry point. Valid: ${Object.keys(PACKAGE_EXPORTS).join(", ")}`,
				offset,
			);
			continue;
		}

		for (const n of names) {
			if (!allowed.includes(n)) {
				report(
					s,
					"import-name",
					`"${n}" is not exported from "${source}". Exports: ${allowed.join(", ")}`,
					offset,
				);
			}
		}
	}

	// Default imports (parsers) and namespace imports also bind names.
	for (const m of s.code.matchAll(
		/import\s+(?:\*\s+as\s+)?([A-Za-z_$][\w$]*)\s*(?:,\s*\{[^}]*\})?\s+from/g,
	)) {
		if (m[1]) imported.add(m[1]);
	}
}

/** Rules 4 and 5 — classes used without being imported or declared. */
function checkInstantiations(s: Snippet, imported: Set<string>): void {
	const declared = new Set<string>();
	for (const m of s.code.matchAll(
		/\b(?:class|function|const|let|var)\s+([A-Za-z_$][\w$]*)/g,
	)) {
		if (m[1]) declared.add(m[1]);
	}

	for (const m of s.code.matchAll(/new\s+([A-Za-z_$][\w$]*)\s*[<(]/g)) {
		const name = m[1];
		if (!name) continue;
		const offset = s.code.slice(0, m.index).split("\n").length;

		if (name === "Object") {
			report(
				s,
				"unknown-class",
				"`new Object(...)` is the JavaScript global — did you mean `ObjectSource`?",
				offset,
			);
			continue;
		}

		if (imported.has(name) || declared.has(name)) continue;
		if (ALLOWED_GLOBAL_CLASSES.has(name)) continue;

		const rule = LAYERFIG_CLASSES.includes(name)
			? "missing-import"
			: "unknown-class";
		const hint = LAYERFIG_CLASSES.includes(name)
			? `import { ${name} } from "@layerfig/config"`
			: "it is neither imported nor declared in this snippet";
		report(s, rule, `\`new ${name}()\` — ${hint}`, offset);
	}
}

/* ------------------------------------------------------------------ */
/* Run                                                                 */
/* ------------------------------------------------------------------ */

const files = walk(DOCS_ROOT);
const snippets: Snippet[] = [];

for (const file of files) {
	const source = readFileSync(file, "utf8");
	snippets.push(
		...(file.endsWith(".astro")
			? extractAstroTemplates(file, source)
			: extractFences(file, source)),
	);
}

const byFile = new Map<string, Snippet[]>();
for (const s of snippets) {
	const bucket = byFile.get(s.file);
	if (bucket) bucket.push(s);
	else byFile.set(s.file, [s]);
}
for (const fileSnippets of byFile.values()) {
	checkCustomPrefix(fileSnippets);
}

for (const s of snippets) {
	checkSlotSyntax(s);

	if (s.lang === "ts" || s.lang === "typescript" || s.lang === "tsx") {
		const imported = new Set<string>();
		checkImports(s, imported);

		/**
		 * Many snippets deliberately show only the part being documented and
		 * leave the surrounding imports out. Those are fragments, not broken
		 * examples. A snippet that already imports from a Layerfig entry point
		 * is presenting itself as a complete, copy-pasteable example — that is
		 * where forgetting one symbol is a real defect.
		 */
		if (/^\s*import[\s\S]*?from\s+["']@layerfig\/config/m.test(s.code)) {
			checkInstantiations(s, imported);
		}
	}
}

const checked = snippets.length;

if (problems.length === 0) {
	console.log(`✓ ${checked} documentation snippets checked, no problems found`);
	process.exit(0);
}

console.error(`✗ ${problems.length} problem(s) in ${checked} snippets:\n`);
for (const p of problems) {
	const rel = path.relative(process.cwd(), p.file);
	console.error(`  ${rel}:${p.line}  [${p.rule}]`);
	console.error(`    ${p.message}\n`);
}
process.exit(1);
