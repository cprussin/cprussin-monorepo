# @cprussin/tsconfig

## 4.0.2

### Patch Changes

- 2382715: Loosen engine range to include node 24

## 4.0.1

### Patch Changes

- 3aba50c: Fix react tsconfig to use react-jsx instead of preserve, only use preserve for nextjs tsconfig

## 4.0.0

### Major Changes

- b34de47: Update dependencies and impose Node v22 as the minimum engine version

## 3.1.2

### Patch Changes

- 7cf3889: Switch to a fork of jest-runner-eslint which adds eslint ^9 to the peerDependencies

## 3.1.1

### Patch Changes

- 232ccea: Fix incorrect homepage URL
- 6ceafec: Update license copyright year

## 3.1.0

### Minor Changes

- 42bd5aa: Update dependencies and properly mark peer dependencies

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
