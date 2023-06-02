import { rm, readFile, writeFile, mkdtemp, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { cli } from "./cli.js";

describe("cli", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "test-cli-"));
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
    await cli(["--removeType", packageJson, packageJsonOut]);
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
