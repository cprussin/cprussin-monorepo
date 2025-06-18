import { fileURLToPath } from "node:url";

export const domConfig = {
  testEnvironment: fileURLToPath(import.meta.resolve("jest-environment-jsdom")),
  setupFilesAfterEnv: [
    fileURLToPath(import.meta.resolve("@testing-library/jest-dom")),
  ],
};
