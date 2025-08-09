import path from "node:path";
import { LoadSourceOptions, Source } from "../sources/source";
import { RuntimeEnv, type UnknownRecord } from "../types";
import { readIfExist } from "../utils/read-if-exist";
import { z } from "../zod-mini";

const APP_ROOT_PATH = process.cwd();

export class FileSource extends Source {
	#fileName: string;

	constructor(fileName: string) {
		super();
		this.#fileName = fileName;
	}

	loadSource(options: FileSourceOptions): UnknownRecord {
		const validatedOptions = FileSourceOptions.parse(options);

		const absoluteConfigFolderPath = path.join(
			APP_ROOT_PATH,
			validatedOptions.relativeConfigFolderPath,
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

export const FileSourceOptions = z.lazy(() => {
	const schema = z.required(LoadSourceOptions, {
		parser: true,
		relativeConfigFolderPath: true,
	});

	return z.extend(schema, {
		runtimeEnv: z._default(RuntimeEnv, process.env),
	});
});
export type FileSourceOptions = z.output<typeof FileSourceOptions>;
