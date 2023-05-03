declare module "@babel/eslint-parser" {
  import { Linter } from "eslint";
  const parser: Linter.ParserModule;
  export default parser;
}

declare module "@babel/plugin-syntax-import-assertions";
