import { base } from "./dist/esm/index.js";

export default [
  ...base,
  {
    ignores: ["integration-tests/__fixtures__/**"],
  },
];
