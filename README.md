# Nexus

![coverage](https://img.shields.io/codecov/c/github/ckb-js/nexus)
![build](https://img.shields.io/github/actions/workflow/status/ckb-js/nexus/test.yaml)

Nexus is an UTxO friendly wallet chrome extension for the CKB blockchain. It is designed to serve both DApp developers and end users.

## Usage

For end users, Nexus Wallet is a browser extension that can be installed on Chrome. User can create/import a wallet, switch connected network, sign data/transaction, and interact with DApps. To download the latest version of Nexus Wallet, please head over to the [release page](https://github.com/ckb-js/nexus/releases).

For DApp developers, Nexus is a library that can be used to interact with the CKB blockchain. The instructions below can help you get started with Nexus.

## Examples

For DApp developers, we have provided some use cases for Nexus, such as enable wallet, transfer CKBs, etc. Please check it out at the [examples directory](https://github.com/ckb-js/nexus/tree/main/examples).

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
# drop the "build" folder into the chrome://extensions to start
npm start
```

## Documentation

- [API Reference](https://github.com/ckb-js/nexus/blob/main/docs/rpc.md)
- [Guide for End Users](https://github.com/ckb-js/nexus/blob/main/docs/user-guide.md)
- [Guide for Developers](https://github.com/ckb-js/nexus/blob/main/docs/get-started.md)
- [FAQs](https://github.com/ckb-js/nexus/blob/main/docs/faq.md)

To read more about Nexus, you can also check out the [docs directory](https://github.com/ckb-js/nexus/blob/main/docs).
