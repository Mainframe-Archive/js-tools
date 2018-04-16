## rpc-browser

[`request-rpc`](../request-rpc) or [`stream-rpc`](../stream-rpc) factory with automatic transport selection.

## Installation

```sh
yarn add @mainframe/rpc-browser
```

## Usage

```js
import browserRPC from '@mainframe/rpc-browser'

const rpcOverHTTP = browserRPC('http://localhost') // RequestRPC using HTTP transport
const rpcOverWS = browserRPC('ws://localhost') // StreamRPC using WebSocket transport
const rpcOverIPC = browserRPC(window.web3.currentProvider) // RequestRPC using Web3 transport
```

## API

### browserRPC()

**Arguments**

1.  `endpoint?: string | Object`: Web3 provider, HTTP or WebSocket URL to connect to. When not provided, `window.web3.currentProvider` will be used if available.

**Returns** [`RequestRPC`](../request-rpc) (with HTTP endpoint or Web3 provider) or [`StreamRPC`](../stream-rpc) (with WebSocket endpoint).

## License

MIT
