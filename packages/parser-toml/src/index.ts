import { ConfigParser } from "@layerfig/config";

import { parse } from "smol-toml";

class TomlParser extends ConfigParser {
	constructor() {
		super({
			acceptedFileExtensions: ["toml"],
		});
	}

	load(fileContent: string) {
		try {
			const parsedJson = parse(fileContent);
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

const tomlParser = new TomlParser();

export default tomlParser;
