/* istanbul ignore file */

import { cli } from "../cli.js";

// We don't actually want to use top-level await here because this file gets
// transpiled to both esm and cjs
// eslint-disable-next-line unicorn/prefer-top-level-await
cli().catch((error: unknown) => {
  throw error;
});
