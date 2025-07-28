import path from "node:path";
import { readIfExist } from "../utils/read-if-exist";
import { type LoadSourceOptions, Source } from "./source";

const APP_ROOT_PATH = process.cwd();

export class FileSource extends Source {
	#fileName: string;

	constructor(fileName: string) {
		super();
		this.#fileName = fileName;
	}

	loadSource({
		relativeConfigFolderPath,
		parser,
		slotPrefix,
		runtimeEnv,
	}: LoadSourceOptions): Record<string, unknown> {
		if (!relativeConfigFolderPath) {
			throw new Error("relativeConfigFolderPath is required");
		}

		if (!parser) {
			throw new Error("Parser is required");
		}

		const absoluteConfigFolderPath = path.join(
			APP_ROOT_PATH,
			relativeConfigFolderPath,
		);

		const absoluteFilePath = path.resolve(
			absoluteConfigFolderPath,
			this.#fileName,
		);
		const fileExtension = this.#getFileExtension(absoluteFilePath);

		if (parser.acceptsExtension(fileExtension) === false) {
			throw new Error(
				`".${fileExtension}" file is not supported by this parser. Accepted files are: "${parser.acceptedFileExtensions.join(
					", ",
				)}"`,
			);
		}

		const fileContentResult = readIfExist(absoluteFilePath);

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
