import path from "node:path";
import { Source } from "../sources/source";
import type { LoadSourceOptions, UnknownRecord } from "../types";
import { readIfExist } from "../utils/read-if-exist";
import { ServerConfigBuilderOptionsSchema } from "./types";

const APP_ROOT_PATH = process.cwd();

export class FileSource extends Source {
	#fileName: string;

	constructor(fileName: string) {
		super();
		this.#fileName = fileName;
	}

	loadSource(options: LoadSourceOptions): UnknownRecord {
		const validatedOptions = ServerConfigBuilderOptionsSchema.parse(options);

		const absoluteConfigFolderPath = path.join(
			APP_ROOT_PATH,
			validatedOptions.configFolder,
		);

		const absoluteFilePath = path.resolve(
			absoluteConfigFolderPath,
			this.#fileName,
		);
		const fileExtension = this.#getFileExtension(absoluteFilePath);

		if (validatedOptions.parser.acceptsExtension(fileExtension) === false) {
			throw new Error(
				`".${fileExtension}" file is not supported by this parser. Accepted files are: "${validatedOptions.parser.acceptedFileExtensions.join(
					", ",
				)}"`,
			);
		}

		const fileContentResult = readIfExist(absoluteFilePath);

		if (fileContentResult.ok === false) {
			throw new Error(fileContentResult.error);
		}

		return this.maybeReplaceSlots({
			contentString: fileContentResult.data,
			slotPrefix: validatedOptions.slotPrefix,
			runtimeEnv: validatedOptions.runtimeEnv,
			transform: (contentString: string) => {
				const parserResult = validatedOptions.parser.load(contentString);

				if (!parserResult.ok) {
					throw parserResult.error;
				}

				return parserResult.data;
			},
		});
	}

	#getFileExtension(filePath: string): string {
		return path.extname(filePath).slice(1);
	}
}
