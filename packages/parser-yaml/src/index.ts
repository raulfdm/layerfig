import { ConfigParser } from "@layerfig/config";

import yaml from "yaml";

class YamlParser extends ConfigParser {
	constructor() {
		super({ acceptedFileExtensions: ["yaml", "yml"] });
	}

	load(fileContent: string) {
		try {
			const parsedJson = yaml.parse(fileContent);
			return {
				ok: true,
				data: parsedJson,
			} as const;
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error
						? error
						: new Error("Something went wrong while parsing file."),
			} as const;
		}
	}
}

const yamlParser = new YamlParser();

export default yamlParser;
