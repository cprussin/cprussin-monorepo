import type { Config } from "prettier";

import { mergeConfigs } from "./merge-configs.js";

describe("mergeConfigs", () => {
  it("merges configs", () => {
    const first: Config = { arrowParens: "avoid" };
    const second: Config = { bracketSameLine: true };
    expect(mergeConfigs([first, second])).toStrictEqual({
      arrowParens: "avoid",
      bracketSameLine: true,
      overrides: [],
      plugins: [],
    });
  });

  it("takes the last value in the case of conflicts", () => {
    const first: Config = { arrowParens: "avoid" };
    const second: Config = { bracketSameLine: true };
    const third: Config = { arrowParens: "always" };
    expect(mergeConfigs([first, second, third])).toStrictEqual({
      arrowParens: "always",
      bracketSameLine: true,
      overrides: [],
      plugins: [],
    });
  });

  it("concatenates overrides", () => {
    const first: Config = { overrides: [{ files: "foo" }, { files: "bar" }] };
    const second: Config = { overrides: [{ files: "baz" }] };
    expect(mergeConfigs([first, second])).toStrictEqual({
      overrides: [{ files: "foo" }, { files: "bar" }, { files: "baz" }],
      plugins: [],
    });
  });
});
