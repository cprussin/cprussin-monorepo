declare module "@eslint/eslintrc" {
  import { Linter } from "eslint";

  export class FlatCompat {
    constructor(args: { resolvePluginsRelativeTo: string });
    extends(...configs: string[]): Linter.FlatConfig[];
  }
}

declare module "@eslint/js" {
  import { Linter } from "eslint";

  const js: {
    configs: {
      recommended: Linter.FlatConfig;
    };
  };

  export default js;
}
