# @cprussin/eslint-config

## 5.1.1

### Patch Changes

- 2382715: Loosen engine range to include node 24

## 5.1.0

### Minor Changes

- f0f1782: added an eslint config rule to error whenever a typescript enum is found to be used.

## 5.0.0

### Major Changes

- b34de47: Update dependencies and impose Node v22 as the minimum engine version

## 4.0.2

### Patch Changes

- 7cf3889: Switch to a fork of jest-runner-eslint which adds eslint ^9 to the peerDependencies

## 4.0.1

### Patch Changes

- 232ccea: Fix incorrect homepage URL
- 6ceafec: Update license copyright year

## 4.0.0

### Major Changes

- 42bd5aa: Update dependencies and properly mark peer dependencies

## 3.0.0

### Major Changes

- 4ecefce: Update dependencies and add eslint v9 compatibility

## 2.0.0

### Major Changes

- 3ac1569: Update dependencies and utilize some features now available with the updated dependencies:

  - Utilize new flat configs for various eslint plugins
  - Extend eslint config with some useful additions (e.g. `eslint-plugin-n`)
  - Fix glob for storybook eslint config
  - Use the new `bundler` tsconfig `moduleResolution` for next.js

## 1.3.0

### Minor Changes

- 0e663b0: Add storybook eslint config
- 0befd73: Add tailwind config
- 7490db3: Update dependencies

### Patch Changes

- d605927: Ensure mjs (and mts, mjsx, and mtsx) files are configured properly
- b3e7a63: Ensure react/jsx-runtime is loaded after react/recommended

## 1.2.0

### Minor Changes

- 758ae34: Update dependencies

## 1.1.0

### Minor Changes

- e94f5a4: Update dependency packages -- most significant change is moving from my fork of jest-runner-eslint to the upstream fork

## 1.0.2

### Patch Changes

- 4b6249b: Fix ordering of conditional exports

## 1.0.1

### Patch Changes

- c060279: Fix distribution of typescript declarations

## 1.0.0

### Major Changes

- 413c8eb: Initial versions of various packages
