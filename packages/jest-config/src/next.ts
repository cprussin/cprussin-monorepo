import { createRequire } from "node:module";

import type { Config } from "@jest/types";
import nextJest from "next/jest.js";

import type { ExtraConfigs } from "./config.js";
import { config, wrap } from "./config.js";

const resolve = createRequire(import.meta.url).resolve;

/**
 * This configuration adds to the base config by wrapping the unit test project
 * by calling `next/jest`. It also adds the `jest-environment-jsdom` test
 * environment, and sets up `@testing-library/jest-dom`.
 *
 * @example
 * ```js
 * // jest.config.js
 * export { nextjs as default } from "@cprussin/jest-config";
 * ```
 *
 * @example
 * ```js
 * // jest.config.js
 * import { nextjs } from "@cprussin/jest-config";
 * export default nextjs({
 *   global: {
 *     config: {
 *       passWithnoTests: true
 *     }
 *   }
 * })
 * ```
 *
 * @param extra - extensions and wrappers for the projects and global jest config
 * @returns the jest config
 */
export const nextjs = (
  extra: ExtraConfigs = {},
): Promise<Config.InitialOptions> =>
  config({
    ...extra,
    unit: {
      wrapper: async (cfg) =>
        wrap(extra.unit?.wrapper, await nextJest.default({ dir: "./" })(cfg)()),
      config: {
        testEnvironment: resolve("jest-environment-jsdom"),
        setupFilesAfterEnv: [resolve("@testing-library/jest-dom")],
        ...extra.unit?.config,
      },
    },
  });
