# rpc-web3

[`rpc-request`](../rpc-request) factory using [`transport-web3`](../transport-web3).

## Installation

```sh
yarn add @mainframe/rpc-web3
```

## Usage

```js
import web3RPC from '@mainframe/rpc-web3'

const rpc = web3RPC('http://localhost')

rpc.request('getUser', ['1234']).then(console.log)
```

## API

### web3RPC()

**Arguments**

1.  `url?: string`: optional HTTP endpoint. When not provided, `window.web3.currentProvider` will be used if available.

**Returns** [`RequestRPC`](../rpc-request)

## License

MIT
