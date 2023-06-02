import { rm, readFile, writeFile, mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { transformPackageJsonContents, transformPackageJson } from "./index.js";

const itHandlesRelativePathRoot = (
  name: string,
  relativePathRoot: string,
  before: Record<string, unknown>,
  after: Record<string, unknown>
): void => {
  it(`does not update ${name} when not set to update relative paths`, () => {
    const transformed = transformPackageJsonContents(before);
    expect(transformed).toStrictEqual(before);
  });

  it(`updates ${name} when set to update relative paths`, () => {
    const transformed = transformPackageJsonContents(before, {
      relativePathRoot,
    });
    expect(transformed).toStrictEqual(after);
  });
};

describe("transformPackageJsonContents", () => {
  it("removes devDependencies", () => {
    const transformed = transformPackageJsonContents({
      foo: "bar",
      devDependencies: { foo: "latest" },
    });
    expect(transformed).toStrictEqual({ foo: "bar" });
  });

  it("removes scripts", () => {
    const transformed = transformPackageJsonContents({
      foo: "bar",
      scripts: { foo: "latest" },
    });
    expect(transformed).toStrictEqual({ foo: "bar" });
  });

  it("removes private", () => {
    const transformed = transformPackageJsonContents({
      foo: "bar",
      private: true,
    });
    expect(transformed).toStrictEqual({ foo: "bar" });
  });

  it("does not remove type when not set", () => {
    const transformed = transformPackageJsonContents({
      foo: "bar",
      type: "module",
    });
    expect(transformed).toStrictEqual({ foo: "bar", type: "module" });
  });

  it("removes type when not set", () => {
    const transformed = transformPackageJsonContents(
      { foo: "bar", type: "module" },
      { removeType: true }
    );
    expect(transformed).toStrictEqual({ foo: "bar" });
  });

  itHandlesRelativePathRoot(
    "main",
    "./foo",
    { main: "./foo/bar/baz" },
    { main: "./bar/baz" }
  );

  itHandlesRelativePathRoot(
    "types",
    "./foo",
    { types: "./bar/baz" },
    { types: "../bar/baz" }
  );

  itHandlesRelativePathRoot(
    "bin as a string",
    "./foo",
    { bin: "./foo/bar/baz" },
    { bin: "./bar/baz" }
  );

  itHandlesRelativePathRoot(
    "bin as a record",
    "./foo",
    { bin: { foo: "./foo/bar/baz", bar: "./foo/bang" } },
    { bin: { foo: "./bar/baz", bar: "./bang" } }
  );

  itHandlesRelativePathRoot(
    "exports as a string",
    "./foo",
    { exports: "./foo/bar/baz" },
    { exports: "./bar/baz" }
  );

  itHandlesRelativePathRoot(
    "exports as an array",
    "./foo",
    { exports: ["./foo/bar/baz", "./foo/bang"] },
    { exports: ["./bar/baz", "./bang"] }
  );

  itHandlesRelativePathRoot(
    "exports as a record",
    "./foo",
    { exports: { foo: "./foo/bar/baz", bar: "./foo/bang" } },
    { exports: { foo: "./bar/baz", bar: "./bang" } }
  );

  itHandlesRelativePathRoot(
    "exports as a conditional export set",
    "./foo",
    { exports: { import: "./foo/bar/baz", require: "./foo/bang" } },
    { exports: { import: "./bar/baz", require: "./bang" } }
  );

  itHandlesRelativePathRoot(
    "exports as a conditional export set with types",
    "./foo",
    {
      exports: {
        import: { default: "./foo/bar/baz", types: "./foo/bar/baz.d.ts" },
        require: { default: "./foo/bang", types: "./foo/bang.d.ts" },
      },
    },
    {
      exports: {
        import: { default: "./bar/baz", types: "./bar/baz.d.ts" },
        require: { default: "./bang", types: "./bang.d.ts" },
      },
    }
  );

  itHandlesRelativePathRoot(
    "exports as a record containing some conditional export sets",
    "./foo",
    {
      exports: {
        foo: "./bar/baz",
        bar: { import: "./foo/bar/baz", require: "./foo/bang" },
      },
    },
    {
      exports: {
        foo: "../bar/baz",
        bar: { import: "./bar/baz", require: "./bang" },
      },
    }
  );
});

describe("transformPackageJson", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "test-transformPackageJson-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true });
  });

  it("transforms the file", async () => {
    const packageJson = join(tmp, "package.json");
    const packageJsonOut = join(tmp, "out", "package.json");
    await mkdir(join(tmp, "out"), { recursive: true });
    await writeFile(
      packageJson,
      JSON.stringify({
        name: "foo",
        private: true,
        type: "module",
        main: "./out/index.js",
        types: "./out/index.d.js",
        exports: {
          import: "./out/esm/index.mjs",
          require: "./out/cjs/index.js",
        },
        scripts: {
          foo: "bar",
        },
        devDependencies: {
          baz: "latest",
        },
      })
    );
    await transformPackageJson(packageJson, packageJsonOut, {
      removeType: true,
    });
    const out = await readFile(packageJsonOut, "utf8");
    expect(JSON.parse(out)).toStrictEqual({
      name: "foo",
      main: "./index.js",
      types: "./index.d.js",
      exports: {
        import: "./esm/index.mjs",
        require: "./cjs/index.js",
      },
    });
  });
});
