import { defineConfigParser } from "@layerfig/config";

import { parse } from "smol-toml";

export default defineConfigParser({
	acceptedFileExtensions: ["toml"],
	parse(fileContent) {
		try {
			const parsedJson = parse(fileContent);
			return {
				ok: true,
				data: parsedJson,
			};
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error
						? error
						: new Error("Something went wrong while parsing file."),
			};
		}
	},
});
