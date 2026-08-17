import type {
	ClientConfigBuilderOptions,
	Prettify,
	ServerConfigBuilderOptions,
} from "../types";

export abstract class Source<T = Record<string, unknown>> {
	/**
	 * An abstract method that must be implemented by any subclass.
	 * It defines the contract for loading a source.
	 *
	 * The returned data is "raw": slots are not replaced here. The
	 * ConfigBuilder merges every source first and only then resolves the
	 * slots, so a slot can reference a value defined in another source.
	 *
	 * @param loadSourceOptions - The options for loading the source.
	 * @returns A record representing the loaded source data.
	 */
	abstract loadSource(loadSourceOptions: LoadSourceOptions): Prettify<T>;
}

type LoadSourceOptions = Prettify<
	Required<ClientConfigBuilderOptions | ServerConfigBuilderOptions>
>;
