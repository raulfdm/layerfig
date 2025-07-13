---
"@layerfig/config": minor
---

Enhanced ObjectSource type inference and flexibility

Improved `ObjectSource` constructor to support both automatic type inference from literal objects and flexible input when explicitly specifying types. This enhancement addresses the challenge of using schema-derived types with environment variables and slots.

**Key improvements:**

- **Automatic type inference**: When passing a literal object, TypeScript now correctly infers the exact type
- **Flexible input for schemas**: When explicitly specifying a type (e.g., from Zod schemas), the constructor accepts strings, environment variables, and slots where the schema expects specific types
- **Backward compatibility**: Existing code continues to work without changes

**Examples:**

```ts
// Automatic type inference from literal object
const config = new ObjectSource({
  port: 3000,
  host: "localhost",
}); // Type is automatically inferred

// Flexible input with explicit schema type
const schema = z.object({
  port: z.coerce.number(),
  host: z.string(),
});

type Schema = z.infer<typeof schema>;

const envSource = new ObjectSource<Schema>({
  port: "$PORT", // String accepted even though schema expects number
  host: "$HOST", // Environment variables and slots work seamlessly
});
```
