# Nexus

![coverage](https://img.shields.io/codecov/c/github/ckb-js/nexus)
![build](https://img.shields.io/github/actions/workflow/status/ckb-js/nexus/test.yaml)

Nexus is a user-friendly UTxO-based wallet extension for Nervos CKB that simplifies the management of CKB assets and transactions.

## Features

- Seamless integration with various Dapps
- Secure key and password management

## Try it Out

You can download the latest wallet from the GitHub [release](https://github.com/ckb-js/nexus/releases) to try it out, and we've provided a [demo](https://demo-nexus.vercel.app/) preview of the Nexus features
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
