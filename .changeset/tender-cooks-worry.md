---
"@layerfig/config": major
---

BREAKING CHANGE: Remove `configFolder` option in favor of `absoluteConfigFolderPath`

The `configFolder` option has been removed and replaced with `absoluteConfigFolderPath` to provide more explicit control over configuration file locations.

**Migration:**


```diff
const config = new ConfigBuilder({
- configFolder: './my-config-folder',
+ absoluteConfigFolderPath: path.resolve(process.cwd(), './my-config-folder')
})
```

This change ensures clearer semantics about path resolution and removes ambiguity about relative path handling.