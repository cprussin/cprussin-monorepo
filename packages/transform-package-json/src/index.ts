/**
 * @packageDocumentation
 *
 * This package contains a CLI and an API for transforming a package.json into a
 * new location while patching relative paths and removing development-only
 * fields.
 *
 * # Installing
 *
 * Use the package manager of your choice to install:
 *
 * - **npm**: `npm install --save-dev @cprussin/transform-package-json`
 * - **pnpm**: `pnpm add -D @cprussin/transform-package-json`
 * - **yarn**: `yarn add -D @cprussin/transform-package-json`
 *
 * # CLI Usage
 *
 * The CLI takes a path to an input `package.json` and a path to an output
 * `package.json`.  It will then run the following transformations on the input,
 * saving the result to the output path:
 *
 * - Remove the `devDependencies` and `scripts` fields
 * - If `--removeType` is paassed, remove the `type` field (for instance, you
 *   may want to do this is you're transpiling ESM to CJS)
 * - Update relative path references so that the new `package.json` points to
 *   the same files as the old one.  Fields that are updated are:
 *   - `main`
 *   - `types`
 *   - `bin`
 *   - `exports`
 *
 * For example, you can use the CLI by calling:
 *
 * ```sh
 * transform-package-json --removeType ./package.json ./dist/package.json
 * ```
 *
 * Which will convert this `package.json`:
 *
 * ```json
 * {
 *   name: "foo",
 *   type: "module",
 *   main: "./dist/index.js",
 *   types: "./dist/index.d.js",
 *   exports: {
 *     import: "./dist/esm/index.mjs",
 *     require: "./dist/cjs/index.js",
 *   },
 *   scripts: {
 *     foo: "bar",
 *   },
 *   devDependencies: {
 *     baz: "latest",
 *   },
 * }
 * ```
 *
 * into this one:
 *
 * ```json
 * {
 *   name: "foo",
 *   main: "./index.js",
 *   types: "./index.d.js",
 *   exports: {
 *     import: "./esm/index.mjs",
 *     require: "./cjs/index.js",
 *   },
 * }
 * ```
 *
 * # API Usage
 *
 * You can use {@link transformPackageJson} with an input path, output path, and
 * optional {@link Options} as a javascript equivalent to the CLI.
 * Alternatively, if you have a non-standard use case for loading/writing files,
 * you can call {@link transformPackageJsonContents}, which takes the parsed
 * contents of a `package.json` and an optional {@link Options} and returns the
 * transformed contents.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * A type for objects whose values may be `T` or may be objects, which
 * recursively may have values of type `T` or deeper objects, and so on
 * @typeParam T - the type of leaf nodes
 */
type Nested<T> = { [key: string]: T | Nested<T> };

/**
 * A simplified type describing the schema of `package.json` files.  Here we
 * only define fields that this library touches.
 */
export type PackageJson = Record<string, unknown> & {
  main?: string;
  types?: string;
  bin?: string | Record<string, string>;
  exports?: string | string[] | Nested<string>;
};

/**
 * Options that control how the `package.json` contents are transformed.
 */
export type Options = {
  /**
   * If `true`, strip the `type` field out when transforming.
   */
  removeType?: boolean;

  /**
   * If passed, this is the new root for relative paths in `main`, `types`,
   * `bin`, and `exports`, relative to the old root.  Typically this is the
   * directory where the output will be written relative to the directory where
   * the input file is.
   *
   * You only need to specify this manually if using {@link
   * transformPackageJsonContents} as it will be automatically derived from the
   * paths passed in when using {@link transformPackageJson}
   *
   * If not specified, relative paths are left alone.
   */
  relativePathRoot?: string;
};

/**
 * Take the contents of a `package.json` file and optional {@link Options} and
 * apply the transformations, returning the results.  In general you won't use
 * this directly and you'll probably want to use {@link transformPackageJson}
 * instead, unless you have unique requirements around loading the
 * `package.json` contents from disk, writing the new contents out, or
 * calculating the new {@link Options.relativePathRoot}.
 *
 * @param contents - the contents of the `package.json` that you'd like to
 * transform
 * @param options - optional {@link Options} which will control the
 * transformation
 * @returns the transformed `package.json` contents
 * @see {@link transformPackageJson}
 */
export const transformPackageJsonContents = (
  contents: PackageJson,
  options?: Options,
): PackageJson => {
  const strippedContents = omit(contents, [
    "devDependencies",
    "scripts",
    "private",
    ...(options?.removeType ? ["type"] : []),
  ]);
  return options?.relativePathRoot
    ? {
        ...strippedContents,
        ...(contents.main && {
          main: relativeWithDot(options.relativePathRoot, contents.main),
        }),
        ...(contents.types && {
          types: relativeWithDot(options.relativePathRoot, contents.types),
        }),
        ...(contents.bin && {
          bin: updateBinPaths(options.relativePathRoot, contents.bin),
        }),
        ...(contents.exports && {
          exports: updateExportsPath(
            options.relativePathRoot,
            contents.exports,
          ),
        }),
      }
    : strippedContents;
};

/**
 * Load the contents of the `package.json` file located at `input`, calculate
 * the relative path root between `input` and `output`, transform the contents
 * using {@link transformPackageJsonContents}, and write the results to
 * `output`.
 *
 * @param input - the path to the input `package.json`
 * @param output - the path that the transformed `package.json` will be written
 * to
 * @param options - optional {@link Options} which will control the
 * transformation
 * @returns an empty promise that resolves when the new file is successfully
 * written
 * @see {@link transformPackageJsonContents}
 */
export const transformPackageJson = async (
  input: string,
  output: string,
  options?: Omit<Options, "relativePathRoot">,
): Promise<void> => {
  const oldPackageJson = JSON.parse(await readFile(input, "utf8")) as Record<
    string,
    unknown
  >;
  const contents = transformPackageJsonContents(oldPackageJson, {
    ...options,
    relativePathRoot: path.relative(path.dirname(input), path.dirname(output)),
  });
  try {
    await mkdir(path.dirname(output), { recursive: false });
  } catch (error) {
    /* istanbul ignore next */
    if (
      !error ||
      typeof error !== "object" ||
      !("code" in error) ||
      error.code !== "EEXIST"
    ) {
      throw error;
    }
  }
  await writeFile(output, JSON.stringify(contents, undefined, 2));
};

const updateBinPaths = (
  newPathRoot: string,
  exports: NonNullable<PackageJson["bin"]>,
): NonNullable<PackageJson["bin"]> =>
  typeof exports === "string"
    ? relativeWithDot(newPathRoot, exports)
    : mapKeys(exports, (entry) => relativeWithDot(newPathRoot, entry));

const updateExportsPath = (
  newPathRoot: string,
  exports: NonNullable<PackageJson["exports"]>,
): NonNullable<PackageJson["exports"]> => {
  if (typeof exports === "string") {
    return relativeWithDot(newPathRoot, exports);
  } else if (Array.isArray(exports)) {
    return exports.map((entry) => relativeWithDot(newPathRoot, entry));
  } else {
    return mapStringKeys(exports, (entry) =>
      relativeWithDot(newPathRoot, entry),
    );
  }
};

const relativeWithDot = (from: string, to: string): string => {
  const relativeWithoutDot = path.relative(from, to);
  return relativeWithoutDot.startsWith(".")
    ? relativeWithoutDot
    : `./${relativeWithoutDot}`;
};

const omit = (
  obj: Record<string, unknown>,
  fields: string[],
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !fields.includes(key)),
  );

const mapKeys = <T, U>(
  obj: Record<string, T>,
  fn: (value: T) => U,
): Record<string, U> =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value)]),
  );

const mapStringKeys = (
  obj: Nested<string>,
  fn: (value: string) => string,
): Nested<string> =>
  mapKeys(obj, (value) =>
    typeof value === "string" ? fn(value) : mapStringKeys(value, fn),
  );
