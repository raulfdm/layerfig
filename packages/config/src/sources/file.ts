import path from "node:path";
import { readIfExist } from "../utils";
import { type LoadSourceOptions, Source } from "./source";

export class FileSource extends Source {
	#fileName: string;

	constructor(fileName: string) {
		super();
		this.#fileName = fileName;
	}

	loadSource({
		configFolderPath,
		parser,
		slotPrefix,
		runtimeEnv,
	}: LoadSourceOptions): Record<string, unknown> {
		const filePath = path.resolve(configFolderPath, this.#fileName);
		const fileExtension = this.#getFileExtension(filePath);

		if (parser.acceptsExtension(fileExtension) === false) {
			throw new Error(
				`".${fileExtension}" file is not supported by this parser. Accepted files are: "${parser.acceptedFileExtensions.join(
					", ",
				)}"`,
			);
		}

		const fileContentResult = readIfExist(filePath);

		if (fileContentResult.ok === false) {
			throw new Error(fileContentResult.error);
		}

		const finalContent = this.maybeReplaceSlotFromValue({
			value: fileContentResult.data,
			slotPrefix,
			runtimeEnv,
		});

		const parserResult = parser.load(finalContent);

		if (!parserResult.ok) {
			throw parserResult.error;
		}

		return parserResult.data;
	}

	#getFileExtension(filePath: string): string {
		return path.extname(filePath).slice(1);
	}
}
