# JS tools

Shared JS libraries for various Mainframe projects.

## Packages

| Name | Version | Description |
| ---- | ------- | ----------- |
| **RPC clients**
| [`@mainframe/rpc-base`](/packages/rpc-base) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-base.svg)](https://www.npmjs.com/package/@mainframe/rpc-base) | Base class for RPC clients
| [`@mainframe/rpc-browser`](/packages/rpc-browser) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-browser.svg)](https://www.npmjs.com/package/@mainframe/rpc-browser) | RPC client factory for browser
| [`@mainframe/rpc-http-browser`](/packages/rpc-http-browser) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-http-browser.svg)](https://www.npmjs.com/package/@mainframe/rpc-http-browser) | RPC client for browser over HTTP
| [`@mainframe/rpc-http-node`](/packages/rpc-http-node) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-http-node.svg)](https://www.npmjs.com/package/@mainframe/rpc-http-node) | RPC client for node over HTTP
| [`@mainframe/rpc-ipc`](/packages/rpc-ipc) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-ipc.svg)](https://www.npmjs.com/package/@mainframe/rpc-ipc) | RPC client for node using IPC
| [`@mainframe/rpc-node`](/packages/rpc-node) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-node.svg)](https://www.npmjs.com/package/@mainframe/rpc-node) | RPC client factory for node
| [`@mainframe/rpc-request`](/packages/rpc-request) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-request.svg)](https://www.npmjs.com/package/@mainframe/rpc-request) | Request-based (stateless) RPC client
| [`@mainframe/rpc-stream`](/packages/rpc-stream) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-stream.svg)](https://www.npmjs.com/package/@mainframe/rpc-stream) | Stream-based (stateful) RPC client
| [`@mainframe/rpc-web3`](/packages/rpc-web3) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-web3.svg)](https://www.npmjs.com/package/@mainframe/rpc-web3) | RPC client for browser using Web3
| [`@mainframe/rpc-ws-browser`](/packages/rpc-ws-browser) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-ws-browser.svg)](https://www.npmjs.com/package/@mainframe/rpc-ws-browser) | RPC client for browser using WebSockets
| [`@mainframe/rpc-ws-node`](/packages/rpc-ws-node) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-ws-node.svg)](https://www.npmjs.com/package/@mainframe/rpc-ws-node) | RPC client for node using WebSockets
| **Transports**
| [`@mainframe/transport-create-http`](/packages/transport-create-http) | [![npm version](https://img.shields.io/npm/v/@mainframe/transport-create-http.svg)](https://www.npmjs.com/package/@mainframe/transport-create-http) | HTTP transport factory
| [`@mainframe/transport-http-browser`](/packages/transport-http-browser) | [![npm version](https://img.shields.io/npm/v/@mainframe/transport-http-browser.svg)](https://www.npmjs.com/package/@mainframe/transport-http-browser) | HTTP transport for browser
| [`@mainframe/transport-http-node`](/packages/transport-http-node) | [![npm version](https://img.shields.io/npm/v/@mainframe/transport-http-node.svg)](https://www.npmjs.com/package/@mainframe/transport-http-node) | HTTP transport for node
| [`@mainframe/transport-ipc`](/packages/transport-ipc) | [![npm version](https://img.shields.io/npm/v/@mainframe/transport-ipc.svg)](https://www.npmjs.com/package/@mainframe/transport-ipc) | IPC transport (node only)
| [`@mainframe/transport-web3`](/packages/transport-web3) | [![npm version](https://img.shields.io/npm/v/@mainframe/transport-web3.svg)](https://www.npmjs.com/package/@mainframe/transport-web3) | Web3 transport (browser only)
| [`@mainframe/transport-ws-browser`](/packages/transport-ws-browser) | [![npm version](https://img.shields.io/npm/v/@mainframe/transport-ws-browser.svg)](https://www.npmjs.com/package/@mainframe/transport-ws-browser) | WebSocket transport for browser
| [`@mainframe/transport-ws-node`](/packages/transport-ws-node) | [![npm version](https://img.shields.io/npm/v/@mainframe/transport-ws-node.svg)](https://www.npmjs.com/package/@mainframe/transport-ws-node) | WebSocket transport for node
| **Security**
| [`@mainframe/secure-file`](/packages/secure-file) | [![npm version](https://img.shields.io/npm/v/@mainframe/secure-file.svg)](https://www.npmjs.com/package/@mainframe/secure-file) | Cryptographic utilities for files
| **Utilities**
| [`@mainframe/rpc-error`](/packages/rpc-error) | [![npm version](https://img.shields.io/npm/v/@mainframe/rpc-error.svg)](https://www.npmjs.com/package/@mainframe/rpc-error) | RPC error class and utilities
| [`@mainframe/utils-base64`](/packages/utils-base64) | [![npm version](https://img.shields.io/npm/v/@mainframe/utils-base64.svg)](https://www.npmjs.com/package/@mainframe/utils-base64) | Base64 strings encoding and decoding
| [`@mainframe/utils-crypto`](/packages/utils-crypto) | [![npm version](https://img.shields.io/npm/v/@mainframe/utils-crypto.svg)](https://www.npmjs.com/package/@mainframe/utils-crypto) | Cryptographic primitives
| [`@mainframe/utils-hex`](/packages/utils-hex) | [![npm version](https://img.shields.io/npm/v/@mainframe/utils-hex.svg)](https://www.npmjs.com/package/@mainframe/utils-hex) | Hexadecimal strings encoding and decoding
| [`@mainframe/utils-id`](/packages/utils-id) | [![npm version](https://img.shields.io/npm/v/@mainframe/utils-id.svg)](https://www.npmjs.com/package/@mainframe/utils-id) | Unique identifier utilities.

## Development

This repository uses [Lerna](https://github.com/lerna/lerna) and [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to manage multiple packages and their dependencies.  
Some tools such as [Flow](https://flow.org/) make this organisation a bit more complex and require additional setup (such as [flow-mono-cli](https://github.com/ImmoweltGroup/flow-mono-cli) for Flow).

### Setup

After pulling the repository,

1.  Run `yarn install` to install the dependencies
1.  Run `yarn bootstrap` to link the packages and setup Flow
1.  Run `yarn start` to compile the packages and run the tests

In the package you want to work on, you can run the local commands such as `yarn build` and `yarn test` getting applied for this package.

### Repository scripts

These scripts affect the entire project rather than individual packages:

- `bootstrap`: bootstraps the packages, creating symlinks and Flow setup
- `build`: runs the `build` script of each package
- `lint`: runs ESLint in all packages
- `lint:fix`: fixes possible ESLint rules
- `test:types`: runs the `test:types` script of each package (`flow check`)
- `test:unit`: runs Jest in the entire project
- `test`: runs `lint`, `test:types` and `test:unit`
- `start`: runs `build` and `test`

Other scripts help with the Flow setup, see the [flow-mono-cli](https://github.com/ImmoweltGroup/flow-mono-cli) documentation for more information.

### Adding a new package

1.  Create a new folder in `packages` with a similar setup to the others (notably make sure to provide `build` and `test:types` scripts in the new package's `package.json`)
1.  `yarn add` the dependencies you need in the new package
1.  Run `yarn bootstrap` in the root folder to ensure the new package is linked with others

## License

MIT\
See [LICENSE](LICENSE) file.
