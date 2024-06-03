# @cprussin/tsconfig

## 3.0.1

### Patch Changes

- 4ecefce: Update dependencies and add eslint v9 compatibility

## 3.0.0

### Major Changes

- 3ac1569: Update dependencies and utilize some features now available with the updated dependencies:

  - Utilize new flat configs for various eslint plugins
  - Extend eslint config with some useful additions (e.g. `eslint-plugin-n`)
  - Fix glob for storybook eslint config
  - Use the new `bundler` tsconfig `moduleResolution` for next.js

## 2.0.0

### Major Changes

- 43a7b7e: Enable `verbatimModuleSyntax` tsconfig option

## 1.2.0

### Minor Changes

- 758ae34: Update dependencies

## 1.1.0

### Minor Changes

- e94f5a4: Update dependency packages -- most significant change is moving from my fork of jest-runner-eslint to the upstream fork

## 1.0.1

### Patch Changes

- 59e341c: Set `moduleResolution` to `node` so that next.js doesn't do it in consuming tsconfig files

## 1.0.0

### Major Changes

- 413c8eb: Initial versions of various packages
