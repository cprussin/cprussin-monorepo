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
 * If you want to take the base config and extend it you can spread it, like so:
 *
 * ```js
 * import { base } from "@cprussin/prettier-config";
 * export default {
 *   ...base,
 *   someSetting: "some-value",
 * };
 * ```
 */

import { Config } from "prettier";

/**
 * Currently the only config. It's literally just an empty object currently. If
 * I ever want to update my format preferences across all my projects, I'll do
 * it here.
 *
 * Possibly, there will be other configs exported in the future if I need
 * different configs for different scenarios for some reason.
 */
export const base: Config = {};
