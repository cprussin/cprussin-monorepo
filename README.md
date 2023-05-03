# [@cprussin](https://www.cprussin.net/)

This repository is a monorepo containing an ever-growing collection of
open-source tools and configs I maintain and use across many of my projects.

## Documentation

[Consolidated monorepo documentation is available here](https://www.cprussin.net/)

## Configs

Note these configs are explicitly designed to be bleeding-edge -- for instance,
they exclusively use ESM where supported, the upcoming eslint flat config
format, etc. Don't expect a lot of backward compatibility prior to the first
releases!

- [@cprussin/eslint-config](https://www.cprussin.net/modules/_cprussin_eslint_config.html):
  A strict (and opinionated) set of configs for generic javascript projects,
  React projects, and next.js projects. These configs are written with the [new
  eslint flat config
  format](https://eslint.org/docs/latest/use/configure/configuration-files-new)
  and has some necessary hacks to make legacy modules that it uses work within
  that format.
- [@cprussin/jest-config](https://www.cprussin.net/modules/_cprussin_jest_config.html):
  A set of shared jest config that configures jest runners for unit testing,
  running prettier checks, and running eslint checks. Configurations are
  exported for use in or out of next.js projects.
- [@cprussin/tsconfig](https://www.cprussin.net/modules/_cprussin_tsconfig.html):
  A set of shared strict tsconfig.json files. Included are a base configuration,
  a configuration for webworkers (including service workers), a configuration
  for React projects, and a configuration for next.js projects.
- [@cprussin/prettier-config](https://www.cprussin.net/modules/_cprussin_prettier_config.html):
  A shared prettier configuration. This is currently empty and really just
  exists so that there's an easy place where I can consistently update things
  across all projects that use my shared configs in case I ever decide to modify
  the prettier defaults.

## Libraries

- [@cprussin/option-result](https://www.cprussin.net/modules/_cprussin_option_result.html):
  Yet another Typescript clone of the Rust `Option` & `Result` enums.

## CLI Tools

- [@cprussin/transform-package-json](https://www.cprussin.net/modules/_cprussin_transform_package_json.html):
  A simple tool to help convert a `package.json` into a slightly different
  release version
