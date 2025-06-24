import type { Result } from "../types";

type ParserFunction = (
	fileContent: string,
) => Result<Record<string, unknown>, Error>;

interface ConfigParserOptions {
	acceptedFileExtensions: string[];
	parse: ParserFunction;
}

export interface ConfigParser {
	acceptsExtension(fileExtension: string): boolean;
	load: ConfigParserOptions["parse"];
	acceptedFileExtensions: ConfigParserOptions["acceptedFileExtensions"];
}

export function defineConfigParser({
	acceptedFileExtensions,
	parse: load,
}: ConfigParserOptions): ConfigParser {
	return {
		acceptsExtension(fileExtension: string): boolean {
			const ext = fileExtension.startsWith(".")
				? fileExtension
				: `.${fileExtension}`;
			return acceptedFileExtensions.some(
				(accepted) => accepted === ext || accepted === ext.slice(1),
			);
		},
		acceptedFileExtensions,
		load,
	};
}
