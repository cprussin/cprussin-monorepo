import { mkDiv } from "./index.js";

describe("sayHello", () => {
  it("says hello", () => {
    expect(mkDiv().outerHTML).toBe("<div></div>");
  });
});
