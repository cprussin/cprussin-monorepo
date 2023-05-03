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
 * # Usage
 *
 * Add the config you want to extend to your `tsconfig.json`, for example:
 *
 * ```json
 * {
 *   "extends": "@cprussin/tsconfig/base.json"
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
 * ## `base.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/base.json"
 * }
 * ```
 *
 * The base configuration that everything else extends from. Sets a bunch of
 * strict options such as `"strict": true`, `"allowJs": false`,
 * `"noFallthroughCasesInSwitch": true`, `"noImplicitReturns": true`, etc. If
 * you want to be as strict as I do and you aren't incrementally adding
 * typescript to a legacy project, you probably don't want to override most of
 * these options, but it might make sense to override the `target` or `lib`
 * options.
 *
 * Note that no options are set for JSX or for DOM libraries. If you need any of
 * that, you'll want to use one of the configs that extends `base.json` instead
 * of using `base.json` directly.
 *
 * ## `dom.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/dom.json"
 * }
 * ```
 *
 * Very simply extends the [`base.json`](#md:basejson) config by adding the
 * `dom` and `dom.iterable` libs.
 *
 * ## `react.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/react.json"
 * }
 * ```
 *
 * Adds the `"jsx": "preserve"` option to the [`dom.json`](#md:domjson) config.
 *
 * ## `nextjs.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/nextjs.json"
 * }
 * ```
 *
 * Adds the [nextjs typescript
 * plugin](https://beta.nextjs.org/docs/configuring/typescript#using-the-typescript-plugin)
 * to the [`react.json`](#md:reactjson) config.
 *
 * ## `webworker.json`
 *
 * ```jsonc
 * // tsconfig.json
 * {
 *   "extends": "@cprussin/tsconfig/webworker.json"
 * }
 * ```
 *
 * Extends the [`base.json`](#md:basejson) config by adding the `webworker` lib.
 */

/* eslint-disable unicorn/no-empty-file */
