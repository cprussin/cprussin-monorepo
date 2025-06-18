import { exec } from "node:child_process";
import { rm, readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { FormattedTestResults } from "@jest/test-result";

const ONE_SECOND_IN_MS = 1000;

const FIXTURES_DIR = path.join(import.meta.dirname, "__fixtures__");

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

const runInFixturePackage = async <T>(
  packageName: string,
  cb: (testDir: string) => Promise<T>,
): Promise<T> => {
  const testDir = path.join(FIXTURES_DIR, packageName);
  const nodeModules = path.join(testDir, "node_modules");
  await execAsync("pnpm i", { cwd: testDir });
  const results = await cb(testDir);
  await rm(nodeModules, { recursive: true });
  return results;
};

const runJestInFixturePackage = async (packageName: string) =>
  runInFixturePackage(packageName, async (testDir) => {
    const resultsFile = path.join(testDir, "test-results.json");
    await execAsync(
      `pnpm exec run-jest --colors --json --outputFile ${resultsFile} .`,
      {
        cwd: testDir,
        // eslint-disable-next-line n/no-process-env
        env: { ...process.env, FORCE_COLOR: "0" },
      },
    );
    const results = JSON.parse(
      await readFile(resultsFile, "utf8"),
    ) as PatchedFormattedTestResults;
    await rm(resultsFile);
    return normalizeResults(testDir, results);
  });

describe("integration", () => {
  describe("base", () => {
    it(
      "installs & works",
      async () => {
        const results = await runJestInFixturePackage("test-package");
        expect(results).toMatchSnapshot();
      },
      120 * ONE_SECOND_IN_MS,
    );
  });

  describe("web", () => {
    it(
      "installs & works",
      async () => {
        const results = await runJestInFixturePackage("test-web-package");
        expect(results).toMatchSnapshot();
      },
      120 * ONE_SECOND_IN_MS,
    );
  });
});

const normalizeResults = (
  testDir: string,
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
      name: testResult.name.replace(testDir, "mocked-root-dir"),
      assertionResults: testResult.assertionResults.map((assertionResult) => ({
        ...assertionResult,
        duration: 0,
        ...("startAt" in assertionResult && {
          startAt: 0,
        }),
        ...("testFilePath" in assertionResult && {
          testFilePath: assertionResult.testFilePath.replace(
            testDir,
            "mocked_root_dir",
          ),
        }),
      })),
    })),
});
