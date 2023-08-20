/**
 * @packageDocumentation
 *
 * This package contains a set of strict base eslint configs for packages using
 * ESM.
 *
 * Note this package exports configs in the [new eslint flat config
 * format](https://eslint.org/docs/latest/use/configure/configuration-files-new).
 *
 * # Installing
 *
 * Use the package manager of your choice to install:
 *
 * - **npm**: `npm install --save-dev @cprussin/eslint-config`
 * - **pnpm**: `pnpm add -D @cprussin/eslint-config`
 * - **yarn**: `yarn add -D @cprussin/eslint-config`
 *
 * # Usage
 *
 * First, ensure you're using ESM (set `"type": "module"` in your
 * `package.json.`).  Then, the most basic `eslint.config.js` could look like
 * this:
 *
 * ```js
 * export { base as default } from "@cprussin/eslint-config";
 * ```
 *
 * To override things, just concat the config you want together, for instance:
 *
 * ```js
 * import { base } from "@cprussin/eslint-config";
 *
 * export default [
 *   ...base,
 *   {
 *     ignores: ["foo/bar/**"],
 *   },
 * ];
 * ```
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

import babelEslintParser from "@babel/eslint-parser";
import babelPluginSyntaxImportAssertions from "@babel/plugin-syntax-import-assertions";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { Linter } from "eslint";
import tsdocPlugin from "eslint-plugin-tsdoc";
import globals from "globals";
import jsoncEslintParser from "jsonc-eslint-parser";
import loadTailwindConfig from "tailwindcss/loadConfig.js";

// The types exported by jsonc-eslint-parser do not currently unify with those
// in @types/eslint, see
// https://github.com/ota-meshi/jsonc-eslint-parser/issues/159
// TODO I should put in a PR to fix this somewhere
const jsonParser = jsoncEslintParser as unknown as Linter.ParserModule;

const compat = new FlatCompat({
  resolvePluginsRelativeTo: path.dirname(fileURLToPath(import.meta.url)),
});

const extendForFiles = (
  glob: string[],
  configs: string[],
): Linter.FlatConfig[] =>
  compat.extends(...configs).map((config) => ({ files: glob, ...config }));

/**
 * This configuration is the base configuration for the others. It can be used
 * standalone in a project that doesn't need one of the extensions. It extends a
 * number of shared configs and sets some strict opinionated configs for the
 * following file types:
 *
 * - Typescript
 * - CJS
 * - ESM
 * - JSON
 * - Jest test files
 *
 * @example
 * ```js
 * // eslint.config.js
 * export { base as default } from "@cprussin/eslint-config";
 * ```
 */
export const base: Linter.FlatConfig[] = [
  js.configs.recommended,
  ...compat.extends(
    "plugin:import/recommended",
    "plugin:unicorn/recommended",
    "prettier",
    "turbo",
  ),
  ...extendForFiles(
    ["**/*.ts?(x)"],
    [
      "plugin:@typescript-eslint/recommended",
      "plugin:@typescript-eslint/recommended-requiring-type-checking",
      "plugin:@typescript-eslint/strict",
      "plugin:import/typescript",
    ],
  ),
  ...extendForFiles(
    ["**/*.test.[tj]s?(x)"],
    ["plugin:jest/recommended", "plugin:jest/style"],
  ),
  ...extendForFiles(["**/*.json"], ["plugin:jsonc/recommended-with-json"]),
  {
    settings: {
      "import/parsers": {
        espree: [".js", ".cjs", ".mjs", ".jsx"],
      },
    },
    rules: {
      "no-alert": "error",
      "no-console": "error",
      // this rule is redundant as resolution errors will cause the transpile
      // and type-check processes to fail, and the resolver behaves slightly
      // differently from the one used by tsc when using nodenext as the tsc
      // module system, which causes false failures
      "import/no-unresolved": "off",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            orderImportKind: "asc",
          },
        },
      ],
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-useless-undefined": ["error", { checkArguments: false }],
    },
  },
  {
    files: ["**/*.ts?(x)"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    plugins: {
      tsdoc: tsdocPlugin,
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "tsdoc/syntax": "error",
    },
  },
  {
    files: ["**/*.?(m)[jt]s?(x)"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Enable parsing files that use the `assert` syntax
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.node,
      parser: babelEslintParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: [babelPluginSyntaxImportAssertions],
        },
      },
    },
  },

  {
    files: ["**/*.test.ts"],
    rules: {
      // Jest still doesn't support ESM natively, see
      // https://github.com/jestjs/jest/issues/9430.  As such, writing code to
      // accommodate this rule will cause jest to fail.
      //
      // This could become a problem if we ever try to unit test code that uses
      // `import.meta`, etc; at that time we may need a better solution.
      "unicorn/prefer-module": "off",
    },
  },

  {
    ignores: [
      ".turbo/**/*",
      "dist/**/*",
      "coverage/**/*",
      "node_modules/**/*",
      "*.tsbuildinfo",
    ],
  },
];

/**
 * This configuration extends the {@link base} configuration and adds the
 * `react`, `react-hooks`, and `jsx-a11y` shared configs. It also adds configs
 * for jest dom tests using the `jest-dom` and `testing-library` shared configs
 * for test files.
 *
 * @example
 * ```js
 * // eslint.config.js
 * export { react as default } from "@cprussin/eslint-config";
 * ```
 */
export const react: Linter.FlatConfig[] = [
  ...base,
  ...compat.extends(
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
  ),
  ...extendForFiles(
    ["**/*.test.[tj]s?(x)"],
    ["plugin:jest-dom/recommended", "plugin:testing-library/react"],
  ),
];

// We have to remove the `import` plugin from the configuration exported by
// nextjs because it conflicts with the plugin we have installed in base.js and
// causes issues.
const nextConfig: Linter.FlatConfig[] = compat
  .extends("next/core-web-vitals")
  .map((cfg) => ({
    ...cfg,
    plugins: Object.fromEntries(
      Object.entries(cfg.plugins ?? {}).filter(
        (plugin) => plugin[0] !== "import",
      ),
    ),
  }));

/**
 * This configuration extends the {@link base} and {@link react} configurations
 * and adds the `next/core-web-vitals` config.
 *
 * @example
 * ```js
 * // eslint.config.js
 * export { nextjs as default } from "@cprussin/eslint-config";
 * ```
 */
export const nextjs: Linter.FlatConfig[] = [
  ...react,
  ...nextConfig,
  {
    files: ["**/*.json"],
    languageOptions: { parser: jsonParser },
  },
  {
    ignores: ["next-env.d.ts", ".next/**/*"],
  },
];

/**
 * This configuration sets up linting for tailwind styles.
 *
 * @param tailwindConfig - the path to the project's tailwind config file
 * @returns the eslint config
 */
export const tailwind = (tailwindConfig: string): Linter.FlatConfig[] => {
  const { content } = loadTailwindConfig(tailwindConfig);

  if (Array.isArray(content)) {
    const _content: string[] = [];
    for (const entry of content) {
      if (typeof entry === "string") {
        _content.push(entry);
      }
    }
    return [
      ...extendForFiles(_content, ["plugin:tailwindcss/recommended"]),
      {
        files: _content,
        rules: {
          "tailwindcss/classnames-order": "off",
          "tailwindcss/enforces-negative-arbitrary-values": "error",
          "tailwindcss/enforces-shorthand": "error",
          "tailwindcss/migration-from-tailwind-2": "error",
          "tailwindcss/no-custom-classname": "error",
          "tailwindcss/no-contradicting-classname": "error",
        },
      },
    ];
  } else {
    throw new TypeError(
      "This eslint config only works if the tailwind content is an array of strings!",
    );
  }
};
