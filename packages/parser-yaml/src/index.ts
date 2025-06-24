import { defineConfigParser } from "@layerfig/config";

import yaml from "yaml";

export default defineConfigParser({
	acceptedFileExtensions: ["yaml", "yml"],
	parse(fileContent) {
		try {
			const parsedJson = yaml.parse(fileContent);
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
