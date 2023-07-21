const { Project } = require("ts-morph");
const ts = require("typescript");

const unique = (items) => [...new Set(items)];

const getExtendForFilesDependencies = (file) =>
  file
    .getDescendantsOfKind(ts.SyntaxKind.CallExpression)
    .filter((node) => {
      const { expression } = node.compilerNode;
      return (
        expression.constructor.name === "IdentifierObject" &&
        expression.escapedText === "extendForFiles"
      );
    })
    .flatMap((expression) => expression.compilerNode.arguments[1].elements)
    .map((argument) => argument.text);

const getCompatExtendsDependencies = (file) =>
  file
    .getDescendantsOfKind(ts.SyntaxKind.CallExpression)
    .filter((node) => {
      const { expression } = node.compilerNode;
      return (
        expression.constructor.name === "NodeObject" &&
        expression.expression.escapedText === "compat" &&
        expression.name.escapedText === "extends"
      );
    })
    .flatMap((expression) => expression.compilerNode.arguments)
    .map((argument) => argument.text)
    .filter((text) => text !== undefined);

const toDependency = (reference) => {
  const base = reference.split("/")[0];
  if (base.startsWith("plugin:")) {
    const stripped = base.replace(/^plugin:/, "");
    return stripped.startsWith("@")
      ? `${stripped}/eslint-plugin`
      : `eslint-plugin-${stripped}`;
  } else {
    return `eslint-config-${base}`;
  }
};

const listLegacyResolvedEslintDependencies = () => {
  const project = new Project({ tsConfigPath: "./tsconfig.json" });
  project.addSourceFileAtPath("./src/index.ts");
  const file = project.getSourceFiles("./src/index.ts")[0];

  return unique(
    [
      ...getCompatExtendsDependencies(file),
      ...getExtendForFilesDependencies(file),
    ].map((reference) => toDependency(reference)),
  );
};

module.exports = {
  depcheck: {
    specials: [listLegacyResolvedEslintDependencies],
  },
};
