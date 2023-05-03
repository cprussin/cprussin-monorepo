import { sayHello } from "./index.js";

describe("sayHello", () => {
  it("says hello", () => {
    expect(sayHello("friend")).toBe("hello friend");
  });
});
