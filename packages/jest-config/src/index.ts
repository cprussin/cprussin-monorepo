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
import { dirname } from "node:path";

import type { Config } from "@jest/types";
import nextJest from "next/jest.js";
import { getSupportInfo } from "prettier";

const getPrettierSupportedExtensions = async () => {
  const { languages } = await getSupportInfo();

  return languages.flatMap((language) => language.extensions ?? []);
};

/**
 * This is the type for values in the optional object that can be passed to each
 * config exported by this package.
 *
 * @typeParam T - either `InitialOptions` (for the `global` key) or
 * `InitialProjectOptions` (for all other keys) from jest
 */
export type ExtraConfig<
  T extends Config.InitialOptions | Config.InitialProjectOptions,
> = {
  /**
   * Additional values to spread into the default config.
   */
  config?: T;

  /**
   * If provided, this wrapper function will be called with the default config
   * to generate the final config.
   *
   * @param config - the default config; if `config` is passed in this
   * `ExtraConfig` as well, it's values will be spread into the default config
   * before calling this function
   * @returns a promise that resolves to the final config value
   */
  wrapper?: (config: T) => Promise<T>;
};

/**
 * This is the type of the optional argument for each of the exported
 * configurations.
 */
export type ExtraConfigs = {
  /**
   * Extra configurations and an an optional wrapper to apply to the global
   * config.
   */
  global?: ExtraConfig<Config.InitialOptions>;

  /**
   * Extra configurations and an an optional wrapper to apply to the `unit`
   * project config.
   */
  unit?: ExtraConfig<Config.InitialProjectOptions>;

  /**
   * Extra configurations and an an optional wrapper to apply to the
   * `integration` project config.
   */
  integration?: ExtraConfig<Config.InitialProjectOptions>;

  /**
   * Extra configurations and an an optional wrapper to apply to the `format`
   * project config.
   */
  format?: ExtraConfig<Config.InitialProjectOptions>;

  /**
   * Extra configurations and an an optional wrapper to apply to the `lint`
   * project config.
   */
  lint?: ExtraConfig<Config.InitialProjectOptions>;
};

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
        preset: dirname(resolve("ts-jest/presets/default-esm/jest-preset.js")),
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
        preset: dirname(resolve("ts-jest/presets/default-esm/jest-preset.js")),
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

const config = async (extra: ExtraConfigs): Promise<Config.InitialOptions> => {
  const prettierExtensions = await getPrettierSupportedExtensions();

  return withExtra(extra.global, {
    coverageThreshold: {
      global: {
        branches: 0,
        functions: 0,
        lines: 0,
        statements: 0,
      },
    },
    coverageReporters: ["json", "lcov", "text", "cobertura"],
    projects: [
      await withExtra(extra.unit, {
        displayName: {
          name: "unit",
          color: "blue",
        },
        testMatch: ["<rootDir>/src/**/*.test.(t|j)s?(x)"],
      }),

      await withExtra(extra.integration, {
        displayName: {
          name: "integration",
          color: "yellow",
        },
        testMatch: ["<rootDir>/integration-tests/**/*.test.(t|j)s?(x)"],
        testPathIgnorePatterns: ["<rootDir>/integration-tests/__fixtures__/"],
      }),

      await withExtra(extra.format, {
        displayName: {
          name: "format",
          color: "white",
        },
        runner: resolve("jest-runner-prettier"),
        moduleFileExtensions: prettierExtensions.map((ext) =>
          ext.replace(/\./, ""),
        ),
        testMatch: prettierExtensions.map((ext) => `**/*${ext}`),
      }),

      await withExtra(extra.lint, {
        displayName: {
          name: "lint",
          color: "magenta",
        },
        runner: resolve("jest-runner-eslint"),
        testMatch: ["<rootDir>/**/*"],
      }),
    ],
  });
};

const withExtra = <
  T extends Config.InitialOptions | Config.InitialProjectOptions,
>(
  extra: ExtraConfig<T> | undefined,
  arg: T,
): Promise<T> => wrap(extra?.wrapper, { ...arg, ...extra?.config });

const wrap = <T>(
  wrapper: ((value: T) => Promise<T>) | undefined,
  arg: T,
): Promise<T> => (wrapper === undefined ? Promise.resolve(arg) : wrapper(arg));
