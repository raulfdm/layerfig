import { ConfigBuilder, FileSource } from "@layerfig/config";
import parserYaml from "@layerfig/parser-yaml";

export const config = new ConfigBuilder({
	validate: (finalConfig, z) =>
		z
			.object({
				branchName: z.string(),
				editLink: z.url(),
			})
			.parse(finalConfig),
	parser: parserYaml,
})
	.addSource(new FileSource("base.yaml"))
	.build();
