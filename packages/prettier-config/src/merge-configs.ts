import { Config } from "prettier";

/**
 * A simple utility to merge an array of configs together.  Later configs in the
 * array override earlier configs in the case of conflicting values.  Plugins
 * and overrides are concatenated together.
 *
 * @param configs - an array of Prettier config objects to merge
 * @returns a merged Prettier config
 */
export const mergeConfigs = (configs: Config[]): Config =>
  Object.assign({}, ...configs, {
    plugins: configs.flatMap((config) => config.plugins ?? []),
    overrides: configs.flatMap((config) => config.overrides ?? []),
  }) as Config;
