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
import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import type { FlatConfig } from "@typescript-eslint/utils/ts-eslint";
import prettier from "eslint-config-prettier";
import jest from "eslint-plugin-jest";
import n from "eslint-plugin-n";
import jsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import tsdoc from "eslint-plugin-tsdoc";
import unicorn from "eslint-plugin-unicorn";
import globals from "globals";
import loadTailwindConfig from "tailwindcss/loadConfig.js";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  resolvePluginsRelativeTo: path.dirname(fileURLToPath(import.meta.url)),
});

const match = (
  files: string[],
  configs: FlatConfig.ConfigArray,
): FlatConfig.ConfigArray => configs.map((config) => ({ ...config, files }));

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
export const base: FlatConfig.ConfigArray = [
  {
    ignores: [
      ".turbo/**/*",
      "dist/**/*",
      "coverage/**/*",
      "node_modules/**/*",
      "*.tsbuildinfo",
    ],
  },

  js.configs.recommended,
  prettier,
  unicorn.configs["flat/recommended"],
  n.configs["flat/recommended"],
  ...fixupConfigRules(compat.extends("plugin:import/recommended", "turbo")),

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
      "n/no-process-env": "error",
      "n/no-missing-import": "off",
      "n/no-unsupported-features/node-builtins": [
        "error",
        {
          allowExperimental: true,
        },
      ],
    },
  },

  ...match(
    ["**/*.ts?(x)"],
    [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      ...fixupConfigRules(compat.extends("plugin:import/typescript")),
      {
        languageOptions: {
          parserOptions: {
            project: ["./tsconfig.json"],
          },
        },
        plugins: { tsdoc },
        rules: {
          "@typescript-eslint/consistent-type-definitions": ["error", "type"],
          "tsdoc/syntax": "error",
        },
      },
    ],
  ),

  ...match(
    ["**/*.test.[tj]s?(x)"],
    [jest.configs["flat/recommended"], jest.configs["flat/style"]],
  ),

  ...match(
    ["**/*.json"],
    fixupConfigRules(compat.extends("plugin:jsonc/recommended-with-json")),
  ),

  ...match(
    ["**/*.?(m)[jt]s?(x)"],
    [
      {
        languageOptions: {
          parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
          },
        },
      },
    ],
  ),

  ...match(
    ["**/*.cjs"],
    [
      {
        languageOptions: {
          globals: globals.node,
        },
      },
    ],
  ),

  // Enable parsing files that use the `assert` syntax
  ...match(
    ["**/*.js"],
    [
      {
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
    ],
  ),

  ...match(
    ["**/*.test.ts"],
    [
      {
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
    ],
  ),
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
export const react: FlatConfig.ConfigArray = [
  ...base,
  ...fixupConfigRules(reactRecommended),
  ...fixupConfigRules(jsxRuntime),
  ...fixupConfigRules(
    compat.extends(
      "plugin:jsx-a11y/recommended",
      "plugin:react-hooks/recommended",
    ),
  ),

  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  ...match(
    ["**/*.test.[tj]s?(x)"],
    fixupConfigRules(
      compat.extends(
        "plugin:jest-dom/recommended",
        "plugin:testing-library/react",
      ),
    ),
  ),
];

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
export const nextjs: FlatConfig.ConfigArray = [
  ...react,
  ...fixupConfigRules(
    compat.extends(
      "plugin:@next/next/recommended",
      "plugin:@next/next/core-web-vitals",
    ),
  ),
  {
    ignores: ["next-env.d.ts", ".next/**/*", ".env*.local"],
  },
];

/**
 * This configuration sets up linting for tailwind styles.
 *
 * @param tailwindConfig - the path to the project's tailwind config file
 * @returns the eslint config
 */
export const tailwind = (tailwindConfig: string): FlatConfig.ConfigArray => {
  const { content } = loadTailwindConfig(tailwindConfig);

  if (Array.isArray(content)) {
    const _content: string[] = [];
    for (const entry of content) {
      if (typeof entry === "string") {
        _content.push(entry);
      }
    }
    return match(_content, [
      ...fixupConfigRules(compat.extends("plugin:tailwindcss/recommended")),
      {
        rules: {
          "tailwindcss/classnames-order": "off",
          "tailwindcss/enforces-negative-arbitrary-values": "error",
          "tailwindcss/enforces-shorthand": "error",
          "tailwindcss/migration-from-tailwind-2": "error",
          "tailwindcss/no-custom-classname": "error",
          "tailwindcss/no-contradicting-classname": "error",
        },
      },
    ]);
  } else {
    throw new TypeError(
      "This eslint config only works if the tailwind content is an array of strings!",
    );
  }
};

/**
 * This configuration sets up the storybook plugin.
 */
export const storybook: FlatConfig.ConfigArray = match(
  ["**/*.story.[tj]sx", "**/story.[tj]sx"],
  fixupConfigRules(compat.extends("plugin:storybook/csf-strict")),
);
