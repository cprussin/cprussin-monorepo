// Use a relative path so we don't introduce a circular dependency.  Not the
// best solution here but turbo doesn't support circular dependencies and I want
// to keep these config packages as separate workspaces but still have tooling
// in each of them.
export { base as default } from "../jest-config/dist/esm/index.js";
