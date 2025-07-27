import type { Result } from "../types";

/**
 * Abstract class for parsing configuration files.
 * It defines the interface for loading configuration data
 * and checks if a file extension is accepted.
 */
export abstract class ConfigParser {
	protected acceptedFileExtensions: string[];

	abstract load(fileContent: string): Result<Record<string, unknown>, Error>;

	constructor(options: { acceptedFileExtensions: string[] }) {
		this.acceptedFileExtensions = options.acceptedFileExtensions;
	}

	acceptsExtension(fileExtension: string): boolean {
		const ext = fileExtension.startsWith(".")
			? fileExtension
			: `.${fileExtension}`;

		return this.acceptedFileExtensions.some(
			(accepted) => accepted === ext || accepted === ext.slice(1),
		);
	}
}
