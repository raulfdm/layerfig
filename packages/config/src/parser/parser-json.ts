import { ConfigParser } from "./config-parser";

class BasicJsonParser extends ConfigParser {
	constructor() {
		super({ acceptedFileExtensions: ["json"] });
	}

	load(fileContent: string) {
		try {
			const content = JSON.parse(fileContent);

			return {
				ok: true,
				data: content,
			} as const;
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error
						? error
						: new Error("Something went wrong while loading the file"),
			} as const;
		}
	}
}

export const basicJsonParser = new BasicJsonParser();
