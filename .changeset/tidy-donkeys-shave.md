---
"@layerfig/config": minor
---

Resolve slots after merging all sources.

Until now every source replaced its own slots while being loaded, so a
self-referencing slot could only point to a value defined in that same source:

```yaml
# base.yaml
foo:
  value: ${MY_VALUE::-bar}
```

```yaml
# production.yaml
foo:
  anotherValue: test-${self.foo.value}
```

Because `production.yaml` doesn't define `foo.value`, `foo.anotherValue` used to
resolve to `undefined`.

Now sources are loaded "raw", merged, and only then the slots are replaced, so
`${self.*}` can reference any value of the final configuration regardless of
which source defined it (and in which order it was added).

Note that, as a side effect, a slot that resolves to `undefined` in a source no
longer falls back to the value defined by a previously added source — the last
source that defines a key still wins, and its unresolved slot becomes
`undefined`.
