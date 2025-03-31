import { createRequire } from "node:module";

import type { Config } from "@jest/types";
import { getSupportInfo } from "prettier";

const resolve = createRequire(import.meta.url).resolve;

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

export const config = async (
  extra: ExtraConfigs,
): Promise<Config.InitialOptions> => {
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
        runner: resolve("@cprussin/jest-runner-prettier"),
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
        runner: resolve("@cprussin/jest-runner-eslint"),
        testMatch: ["<rootDir>/**/*"],
      }),
    ],
  });
};

const getPrettierSupportedExtensions = async () => {
  const { languages } = await getSupportInfo();

  return languages.flatMap((language) => language.extensions ?? []);
};

const withExtra = <
  T extends Config.InitialOptions | Config.InitialProjectOptions,
>(
  extra: ExtraConfig<T> | undefined,
  arg: T,
): Promise<T> => wrap(extra?.wrapper, { ...arg, ...extra?.config });

export const wrap = <T>(
  wrapper: ((value: T) => Promise<T>) | undefined,
  arg: T,
): Promise<T> => (wrapper === undefined ? Promise.resolve(arg) : wrapper(arg));
