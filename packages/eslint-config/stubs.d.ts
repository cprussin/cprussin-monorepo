declare module "eslint-config-prettier" {
  import type { Linter } from "eslint";
  const config: Linter.FlatConfig;
  export default config;
}

declare module "eslint-plugin-jest" {
  import type { Linter } from "eslint";
  export const configs: {
    "flat/recommended": Linter.FlatConfig;
    "flat/style": Linter.FlatConfig;
  };
}

declare module "eslint-plugin-n" {
  import type { Linter } from "eslint";
  export const configs: {
    "flat/recommended": Linter.FlatConfig;
  };
}

declare module "eslint-plugin-react/configs/jsx-runtime.js" {
  import type { Linter } from "eslint";
  const config: Linter.FlatConfig;
  export default config;
}

declare module "eslint-plugin-react/configs/recommended.js" {
  import type { Linter } from "eslint";
  const config: Linter.FlatConfig;
  export default config;
}

declare module "eslint-plugin-unicorn" {
  import type { Linter } from "eslint";
  export const configs: {
    "flat/recommended": Linter.FlatConfig;
  };
}
