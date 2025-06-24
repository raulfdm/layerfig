import { defineConfigParser } from "@layerfig/config";

import json5 from "json5";

export default defineConfigParser({
	acceptedFileExtensions: ["json", "jsonc", "json5"],
	parse(fileContent) {
		try {
			const parsedJson = json5.parse(fileContent);
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
