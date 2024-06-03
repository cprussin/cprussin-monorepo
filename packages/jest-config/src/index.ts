/**
 * @packageDocumentation
 *
 * This package contains a set of jest configs that set up runners for running
 * unit tests, integration tests, eslint, and prettier.
 *
 * # Installing
 *
 * Use the package manager of your choice to install:
 *
 * - **npm**: `npm install --save-dev @cprussin/jest-config`
 * - **pnpm**: `pnpm add -D @cprussin/jest-config`
 * - **yarn**: `yarn add -D @cprussin/jest-config`
 *
 * # Usage
 *
 * 1. Set up your `jest.config.js`, for example:
 *
 * ```js
 * export { base as default } from "@cprussin/jest-config";
 * ```
 *
 * 2. Run `jest` to run format checks, lint checks, unit tests, and integration
 *    tests, or use `--selectProjects` to run a [subset of
 *    checks](#md:projects).
 *
 * 3. Add scripts to your `package.json` if you'd like. For instance:
 *
 * ```json
 * {
 *   "scripts": {
 *     "test:format": "jest --selectProjects format",
 *     "test:integration": "jest --selectProjects integration",
 *     "test:lint": "jest --selectProjects lint",
 *     "test:unit": "jest --coverage --selectProjects unit"
 *   }
 * }
 * ```
 *
 * # Projects
 *
 * Configurations exported with this package will set up the following jest
 * projects:
 *
 * - `format`: Check code style with prettier using `jest-runner-prettier`.
 * - `integration`: Tests that run out of the `integration-tests` directory.
 *   Functionally not much different than `unit`, but you can have a separate
 *   configuration, different pipeline dependencies, etc.
 * - `lint`: Run eslint checks using `jest-runner-eslint`.
 * - `unit`: Need I say more?
 *
 * Running `jest` will run all four projects. You can run a subset of the
 * projects using jest's `--selectProjects` argument, as usual.
 *
 * # Options
 *
 * If you need to, you can extend or wrap the configs generated here by calling
 * the config you want and passing an object as an argument that describes your
 * modifications. The object can have any combination of the following keys:
 *
 * - `format`: Specify extensions or wrappers for the `format` project.
 * - `global`: Specify extensions or wrappers for the top-level jest config.
 * - `integration`: Specify extensions or wrappers for the `integration` project.
 * - `lint`: Specify extensions or wrappers for the `lint` project.
 * - `unit`: Specify extensions or wrappers for the `unit` project.
 *
 * The value for each of those keys should be an object containing either or
 * both of `config`, an object whose values will be spread into the relevant
 * project or global config, and `wrapper`, a function that should take the
 * config and return a promise containing the final config. For example:
 *
 * ```js
 * import { base } from "@cprussin/jest-config";
 *
 * export default base({
 *   global: {
 *     wrapper: async (oldGlobalConfig) => doSomethingAsyncWith(oldGlobalConfig),
 *     config: {
 *       passWithNoTests: true,
 *     },
 *   },
 *   unit: {
 *     wrapper: async (oldUnitConfig) => doSomethingAsyncWith(oldUnitConfig),
 *   },
 *   format: {
 *     config: {
 *       testPathIgnorePatterns: ["foo/*"],
 *     },
 *   },
 * });
 * ```
 *
 * Note that the extensions will be spread _before_ calling the wrapper (so the
 * values in the `config` option will be present in the argument to the
 * `wrapper`).
 */

import { createRequire } from "node:module";
import path from "node:path";

import type { Config } from "@jest/types";

import type { ExtraConfigs } from "./config.js";
import { config } from "./config.js";

const resolve = createRequire(import.meta.url).resolve;

/**
 * The base config which is recommended in most cases that don't need DOM
 * testing.  Sets up the standard projects and uses `ts-jest` to run unit tests.
 *
 * @example
 * ```js
 * // jest.config.js
 * export { base as default } from "@cprussin/jest-config";
 * ```
 *
 * @example
 * ```js
 * // jest.config.js
 * import { base } from "@cprussin/jest-config";
 * export default base({
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
export const base = (
  extra: ExtraConfigs = {},
): Promise<Config.InitialOptions> =>
  config({
    ...extra,
    unit: {
      ...extra.unit,
      config: {
        preset: path.dirname(
          resolve("ts-jest/presets/default-esm/jest-preset.js"),
        ),
        // TODO This transform is here because of
        // https://github.com/kulshekhar/ts-jest/issues/4081, see specifically
        // https://github.com/kulshekhar/ts-jest/issues/4081#issuecomment-1503684089.
        // There's probably a better way to fix this, we should find the right
        // fix and use it.
        transform: {
          "^.+\\.tsx?$": [
            "ts-jest",
            {
              isolatedModules: true,
              useESM: true,
            },
          ],
        },
        moduleNameMapper: {
          "^(\\.{1,2}/.*)\\.js$": "$1",
        },
        ...extra.unit?.config,
      },
    },
    integration: {
      ...extra.integration,
      config: {
        preset: path.dirname(
          resolve("ts-jest/presets/default-esm/jest-preset.js"),
        ),
        // TODO This transform is here because of
        // https://github.com/kulshekhar/ts-jest/issues/4081, see specifically
        // https://github.com/kulshekhar/ts-jest/issues/4081#issuecomment-1503684089.
        // There's probably a better way to fix this, we should find the right
        // fix and use it.
        transform: {
          "^.+\\.tsx?$": [
            "ts-jest",
            {
              isolatedModules: true,
              useESM: true,
            },
          ],
        },
        moduleNameMapper: {
          "^(\\.{1,2}/.*)\\.js$": "$1",
        },
        ...extra.integration?.config,
      },
    },
  });
