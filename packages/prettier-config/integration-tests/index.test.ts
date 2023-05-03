import { exec } from "node:child_process";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

const ONE_SECOND_IN_MS = 1000;

const TEST_DIR = join(__dirname, "__fixtures__", "test-package");
const NODE_MODULES = join(TEST_DIR, "node_modules");

const execAsync = promisify(exec);

describe("integration", () => {
  beforeEach(async () => {
    await rm(NODE_MODULES, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(NODE_MODULES, { recursive: true });
  });

  it(
    "installs & works",
    async () => {
      await execAsync("pnpm --ignore-workspace i", { cwd: TEST_DIR });
      const { stderr } = await execAsync(
        "pnpm exec prettier --check . || true",
        { cwd: TEST_DIR, env: { ...process.env, FORCE_COLOR: "0" } }
      );
      expect(stderr).toMatchSnapshot();
    },
    30 * ONE_SECOND_IN_MS
  );
});
