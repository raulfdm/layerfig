---
"@layerfig/parser-json5": patch
"@layerfig/parser-toml": patch
"@layerfig/parser-yaml": patch
"@layerfig/config": patch
---

Fix package metadata and README examples.

All three parser packages pointed `repository.directory` at `packages/config`
instead of their own directory, so npm's "source" link went to the wrong
package. `@layerfig/parser-json5` also advertised only `.jsonc` and `.json5`
even though it accepts `.json` as well.

Every parser README showed an import from `@layerfig/config/sources/file`, a
subpath that is not exported and fails to resolve — `FileSource` comes from the
package root:

```diff
-import { FileSource } from "@layerfig/config/sources/file";
+import { ConfigBuilder, FileSource } from "@layerfig/config";
```

The `@layerfig/config` README referenced its logo with a repo-relative path,
which breaks on npmjs.com, and carried a `semantic-release` badge (the repo
releases with Changesets) plus a bundle-size badge whose externals still listed
`lodash-es` from before the move to `es-toolkit`.
