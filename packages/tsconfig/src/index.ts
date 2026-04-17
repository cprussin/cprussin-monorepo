/**
 * @packageDocumentation
 *
 * This package contains a set of strict shared typescript configs.
 *
 * # Installing
 *
 * Use the package manager of your choice to install:
 *
 * - **npm**: `npm install --save-dev @cprussin/tsconfig`
 * - **pnpm**: `pnpm add -D @cprussin/tsconfig`
 * - **yarn**: `yarn add -D @cprussin/tsconfig`
 *
 * Each config targets a specific runtime via its ambient `types`. Pick the
 * `-node` variant if your project runs on Node, or the `-bun` variant if it
 * runs on Bun, and install the matching types package:
 *
 * - **`-node` variants**: `@types/node`
 * - **`-bun` variants**: `@types/bun`
 *
 * # Usage
 *
 * Add the config you want to extend to your `tsconfig.json`, for example:
 *
 * ```json
 * {
 *   "extends": "@cprussin/tsconfig/base-node.json"
 * }
 * ```
 *
 * Note that `"noEmit": true` is set by configs here. The intention is that most
 * of the case, you're type checking with typescript and distributed
 * untranspiled files, or that if you're transpiling then the transpilation
 * tools you're using will override that setting in their own configs as
 * needed. For instance, if you're using `webpack`, you could configure
 * `ts-loader` like this:
 *
 * ```js
 * {
 *   loader: "ts-loader",
 *   options: {
 *     compilerOptions: {
 *       sourceMap: process.env.NODE_ENV === "development",
 *       noEmit: false,
 *     },
 *   },
 * }
 * ```
 *
 * Or you could have a `build` script in your `package.json` that runs `tsc`
 * directly:
 *
 * ```json
 * {
 *   "name": "foo",
 *   "scripts": {
 *     "build": "tsc --noEmit false --outDir ./dist"
 *   }
 * }
 * ```
 *
 * # Configurations
 *
 * Every config ships in two variants, one for each supported runtime:
 *
 * | Scenario             | Node variant           | Bun variant           |
 * | -------------------- | ---------------------- | --------------------- |
 * | Generic / server     | `base-node.json`       | `base-bun.json`       |
 * | Browser / DOM        | `dom-node.json`        | `dom-bun.json`        |
 * | React                | `react-node.json`      | `react-bun.json`      |
 * | Next.js              | `nextjs-node.json`     | `nextjs-bun.json`     |
 * | Web worker           | `webworker-node.json`  | `webworker-bun.json`  |
 *
 * The only difference between the `-node` and `-bun` variants of a given
 * config is the ambient `types` array: the Node variants set `["node"]`, and
 * the Bun variants set `["bun"]`. Everything else — libs, module, strictness
 * settings, etc. — is identical.
 *
 * ## `base-node.json` / `base-bun.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/base-node.json"
 * }
 * ```
 *
 * The baseline configuration that everything else extends from. Sets a bunch
 * of strict options such as `"strict": true`, `"allowJs": false`,
 * `"noFallthroughCasesInSwitch": true`, `"noImplicitReturns": true`, etc. If
 * you want to be as strict as I do and you aren't incrementally adding
 * typescript to a legacy project, you probably don't want to override most of
 * these options, but it might make sense to override the `target` or `lib`
 * options.
 *
 * Note that no options are set for JSX or for DOM libraries. If you need any
 * of that, you'll want to use one of the configs that extends `base-*.json`
 * instead of using it directly.
 *
 * ## `dom-node.json` / `dom-bun.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/dom-node.json"
 * }
 * ```
 *
 * Extends the corresponding [`base-*.json`](#md:base-nodejson--base-bunjson)
 * config by adding the `dom` and `dom.iterable` libs.
 *
 * ## `react-node.json` / `react-bun.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/react-node.json"
 * }
 * ```
 *
 * Adds the `"jsx": "react-jsx"` option to the corresponding
 * [`dom-*.json`](#md:dom-nodejson--dom-bunjson) config.
 *
 * ## `nextjs-node.json` / `nextjs-bun.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/nextjs-node.json"
 * }
 * ```
 *
 * Adds the [nextjs typescript
 * plugin](https://beta.nextjs.org/docs/configuring/typescript#using-the-typescript-plugin)
 * to the corresponding
 * [`react-*.json`](#md:react-nodejson--react-bunjson) config, and switches
 * `jsx` to `preserve` along with `module`/`moduleResolution` set for
 * bundler-based workflows.
 *
 * ## `webworker-node.json` / `webworker-bun.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/webworker-node.json"
 * }
 * ```
 *
 * Extends the corresponding [`base-*.json`](#md:base-nodejson--base-bunjson)
 * config by adding the `webworker` lib.
 */

/* eslint-disable unicorn/no-empty-file */
