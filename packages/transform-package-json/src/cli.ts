import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { transformPackageJson } from "./index.js";

export const cli = async (
  /* istanbul ignore next */ argv: string[] = hideBin(process.argv),
): Promise<void> => {
  await yargs(argv)
    .scriptName("transform-package-json")
    .command(
      "$0 <source> <dest>",
      "Transform SOURCE to DEST",
      (yargs) =>
        yargs
          .positional("source", {
            describe: "the path to the source package.json",
            type: "string",
            demandOption: true,
          })
          .positional("dest", {
            describe: "the path to the destination package.json",
            type: "string",
            demandOption: true,
          })
          .options({
            "remove-type": {
              describe:
                "if set, the `type` field of the `package.json` will be removed as well",
              type: "boolean",
              default: false,
            },
          })
          .options({
            "remove-private": {
              describe:
                "if set, the `private` field of the `package.json` will be removed as well",
              type: "boolean",
              default: true,
            },
          }),
      ({ source, dest, removeType, removePrivate }) =>
        transformPackageJson(source, dest, { removeType, removePrivate }),
    )
    .help().argv;
};
