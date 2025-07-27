import { ConfigParser } from "@layerfig/config";

import json5 from "json5";

class Json5Parser extends ConfigParser {
	constructor() {
		super({
			acceptedFileExtensions: ["json", "jsonc", "json5"],
		});
	}

	load(fileContent: string) {
		try {
			const parsedJson = json5.parse(fileContent);
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

const json5Parser = new Json5Parser();

export default json5Parser;
