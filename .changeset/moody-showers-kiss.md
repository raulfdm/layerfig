---
"@layerfig/config": major
---

BREAKING CHANGE: Remove `defineConfigParser` in favor of `ConfigParser` class.

### Details

Before, for creating a custom parser you'd use the `defineConfigParser` function:

```ts
import { defineConfigParser } from "@layerfig/config";

export const customParser = defineConfigParser({
  acceptedFileExtensions: ["ini"],
  parse: (fileContent) => {
    // Logic to fetch, read, and parse the content
  },
});
```

Now, to achieve the same you have to define a class that extends `ConfigParser`:

```ts
// ./path/to/custom-parser.ts
import { ConfigParser } from "@layerfig/config";

class IniParser extends ConfigParser {
  constructor() {
    super({
      acceptedFileExtensions: ["ini"],
    });
  }

  load(fileContent: string) {
    // Logic to fetch, read, and parse the content
    // should return a Result
  }
}

export const iniParser = new InitParser();
```

This will mostly help on lib internal checks and validations.
