# Nexus

An UTxO friendly wallet extension for CKB

![coverage](https://img.shields.io/codecov/c/github/ckb-js/nexus)
![build](https://img.shields.io/github/actions/workflow/status/ckb-js/nexus/test.yaml)

## Quick Start

- Node.js 18+
- npm 7+

```sh
git clone --recurse-submodules https://github.com/ckb-js/nexus.git
cd nexus
npm install
npm run build
npm run test

# start the test server
# and the `packages/extension-chrome/build` will be generated
# drop the "build" folder into the chrome://extension to start
npm start
```
