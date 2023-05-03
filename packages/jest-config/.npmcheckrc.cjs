const { Project } = require("ts-morph");
const ts = require("typescript");

const isResolveNode = (expression) =>
  expression.constructor.name === "IdentifierObject" &&
  expression.escapedText === "resolve";

const normalize = (requireName) => {
  return requireName.includes("/") && !requireName.startsWith("@")
    ? requireName.split("/")[0]
    : requireName;
};

const listResolvedModules = () => {
  const project = new Project({ tsConfigPath: "./tsconfig.json" });
  project.addSourceFileAtPath("./src/index.ts");
  return project
    .getSourceFiles("./src/index.ts")[0]
    .getDescendantsOfKind(ts.SyntaxKind.CallExpression)
    .filter((node) => isResolveNode(node.compilerNode.expression))
    .flatMap((expression) =>
      normalize(expression.compilerNode.arguments[0].text)
    );
};

module.exports = {
  depcheck: {
    specials: [listResolvedModules],
  },
};
