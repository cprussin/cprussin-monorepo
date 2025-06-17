import { exec } from "node:child_process";
import { rm, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { FormattedTestResults } from "@jest/test-result";

const ONE_SECOND_IN_MS = 1000;

const TEST_DIR = path.join(import.meta.dirname, "__fixtures__", "test-package");
const NODE_MODULES = path.join(TEST_DIR, "node_modules");

const execAsync = promisify(exec);

type TestResult = FormattedTestResults["testResults"][number];
type AssertionResult = TestResult["assertionResults"][number];

// For some reason, `testFilePath` shows up in the test results but doesn't
// exist in the types that Jest distributes, so let's patch it in so typescript
// doesn't fail the code below.
type PatchedFormattedTestResults = Omit<FormattedTestResults, "testResults"> & {
  testResults: (Omit<TestResult, "assertionResults"> & {
    assertionResults: (AssertionResult & {
      testFilePath?: string;
    })[];
  })[];
};

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
      const resultsFile = path.join(TEST_DIR, "test-results.json");
      await execAsync("pnpm i", { cwd: TEST_DIR });
      await execAsync(
        `pnpm exec run-jest --colors --json --outputFile ${resultsFile} .`,
        {
          cwd: TEST_DIR,
          // eslint-disable-next-line n/no-process-env
          env: { ...process.env, FORCE_COLOR: "0" },
        },
      );
      const testResults = JSON.parse(
        await readFile(resultsFile, "utf8"),
      ) as PatchedFormattedTestResults;
      await rm(resultsFile);
      expect(normalizeResults(testResults)).toMatchSnapshot();
    },
    120 * ONE_SECOND_IN_MS,
  );
});

const normalizeResults = (
  results: PatchedFormattedTestResults,
): PatchedFormattedTestResults => ({
  ...results,
  startTime: 0,
  testResults: results.testResults
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((testResult) => ({
      ...testResult,
      startTime: 0,
      endTime: 0,
      name: testResult.name.replace(TEST_DIR, "mocked-root-dir"),
      assertionResults: testResult.assertionResults.map((assertionResult) => ({
        ...assertionResult,
        duration: 0,
        ...("testFilePath" in assertionResult && {
          testFilePath: assertionResult.testFilePath.replace(
            TEST_DIR,
            "mocked_root_dir",
          ),
        }),
      })),
    })),
});
