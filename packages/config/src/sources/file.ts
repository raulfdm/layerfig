import path from "node:path";
import { readIfExist } from "../utils";
import { type LoadSourceOptions, Source } from "./type";

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

		const finalContent = this.#replaceSlots({
			fileContent: fileContentResult.data,
			runtimeEnv,
			slotPrefix,
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

	#replaceSlots({
		fileContent,
		runtimeEnv,
		slotPrefix,
	}: {
		fileContent: string;
		slotPrefix: LoadSourceOptions["slotPrefix"];
		runtimeEnv: LoadSourceOptions["runtimeEnv"];
	}) {
		const regex = new RegExp(`\\${slotPrefix}\\w+`, "g");

		const matches = fileContent.match(regex);

		if (matches === null) {
			return fileContent;
		}

		const uniqueSlots = new Set(matches);

		let copy = fileContent;

		for (const slot of uniqueSlots) {
			const slotWithoutPrefix = slot.replace(slotPrefix, "");
			const value = runtimeEnv[slotWithoutPrefix];

			// Do not replace if the variable is not there
			if (typeof value === "string" && value !== "undefined") {
				copy = copy.replaceAll(slot, value);
			}
		}

		return copy;
	}
}
