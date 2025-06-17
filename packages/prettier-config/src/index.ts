/**
 * @packageDocumentation
 *
 * This package contains a prettier config. It's empty right now, and only
 * exists to be a convenient place to add configs in the future if I ever need
 * to such that I'll apply them consistently across my projects.
 *
 * # Installing
 *
 * Use the package manager of your choice to install:
 *
 * - **npm**: `npm install --save-dev @cprussin/prettier-config`
 * - **pnpm**: `pnpm add -D @cprussin/prettier-config`
 * - **yarn**: `yarn add -D @cprussin/prettier-config`
 *
 * # Usage
 *
 * Just export the config from your prettier config file. For example, in
 * `prettier.config.js`:
 *
 * ```js
 * export { base as default } from "@cprussin/prettier-config";
 * ```
 *
 * If you want to combine configs or take the base config and extend it you use
 * `mergeConfigs`, like so:
 *
 * ```js
 * import { base, tailwind, mergeConfigs } from "@cprussin/prettier-config";
 *
 * export default mergeConfigs([
 *   base,
 *   tailwind('./tailwind.config.js'),
 *   { someSetting: "some-value" }
 * ]);
 * ```
 */

import { fileURLToPath } from "node:url";

import type { Config } from "prettier";
import type { PluginOptions } from "prettier-plugin-tailwindcss";

export { mergeConfigs } from "./merge-configs.js";

/**
 * The base config. It's literally just an empty object currently. If I ever
 * want to update my format preferences across all my projects, I'll do it here.
 */
export const base: Config = {};

/**
 * Construct a config for projects using Tailwind.  Adds the tailwind plugin and
 * sets up some common tailwind options.
 *
 * @param tailwindConfig - the path to the project's tailwind config file
 * @returns the Prettier config
 */
export const tailwind = (
  tailwindConfig: string,
): Config & Partial<PluginOptions> => ({
  plugins: [fileURLToPath(import.meta.resolve("prettier-plugin-tailwindcss"))],
  tailwindFunctions: ["clsx", "classnames"],
  tailwindConfig,
});
