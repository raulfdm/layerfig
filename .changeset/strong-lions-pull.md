---
"@layerfig/config": minor
---

Removed the `z.instanceOf(ConfigParser)` validation from the server's
`ConfigBuilder.options.parser` option.

Previously, this validation could incorrectly fail when using parsers such as
`@layerfig/parser-toml`. At runtime, `instanceof tomlParser` was not considered
equal to `ConfigParser`, even though `tomlParser` extends `ConfigParser`.

Now, the `parser` option is no longer validated in this way.