import type { Config } from "@jest/types";

import type { ExtraConfigs } from "./config.js";
import { domConfig } from "./dom.js";
import { base } from "./index.js";

/**
 * This configuration adds the `jest-environment-jsdom` test environment to the
 * base config, and sets up `@testing-library/jest-dom`.
 *
 * @example
 * ```js
 * // jest.config.js
 * export { dom as default } from "@cprussin/jest-config";
 * ```
 *
 * @example
 * ```js
 * // jest.config.js
 * import { dom } from "@cprussin/jest-config";
 * export default dom({
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
export const web = (extra: ExtraConfigs = {}): Promise<Config.InitialOptions> =>
  base({
    ...extra,
    unit: {
      config: {
        ...domConfig,
        ...extra.unit?.config,
      },
    },
    integration: {
      config: {
        ...domConfig,
        ...extra.integration?.config,
      },
    },
  });
