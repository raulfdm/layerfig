import { defineConfigParser } from "./define-config-parser";

export const basicJsonParser = defineConfigParser({
	acceptedFileExtensions: ["json"],
	parse: (fileContent) => {
		try {
			const content = JSON.parse(fileContent);

			return {
				ok: true,
				data: content,
			};
		} catch (error) {
			return {
				ok: false,
				error:
					error instanceof Error
						? error
						: new Error("Something went wrong while loading the file"),
			};
		}
	},
});
