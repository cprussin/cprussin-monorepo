import { exec } from "node:child_process";
import { rm, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const ONE_SECOND_IN_MS = 1000;

const TEST_DIR = path.join(__dirname, "__fixtures__", "test-package");
const NODE_MODULES = path.join(TEST_DIR, "node_modules");
const OUT_PACKAGE_JSON = path.join(TEST_DIR, "out.package.json");

const execAsync = promisify(exec);

describe("integration", () => {
  beforeEach(async () => {
    await rm(NODE_MODULES, { recursive: true, force: true });
    await rm(OUT_PACKAGE_JSON, { force: true });
  });

  afterEach(async () => {
    await rm(NODE_MODULES, { recursive: true });
    await rm(OUT_PACKAGE_JSON);
  });

  it(
    "installs & works",
    async () => {
      await execAsync("pnpm --ignore-workspace i", { cwd: TEST_DIR });
      await execAsync(
        "pnpm exec transform-package-json ./package.json ./out.package.json",
        { cwd: TEST_DIR },
      );
      const out = await readFile(OUT_PACKAGE_JSON, "utf8");
      expect(out).toMatchSnapshot();
    },
    30 * ONE_SECOND_IN_MS,
  );
});
