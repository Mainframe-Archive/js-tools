## rpc-ipc

[`stream-rpc`](../stream-rpc) factory using [`transport-ipc`](../transport-ipc).

## Installation

```sh
yarn add @mainframe/rpc-ipc
```

## Usage

```js
import ipcRPC from '@mainframe/rpc-ipc'

const rpc = wsRPC('/path/to/socket')

rpc.request('getUser', ['1234']).then(console.log)
```

## API

### ipcRPC()

**Arguments**

1.  `path: string`

**Returns** [`StreamRPC`](../stream-rpc)

## License

MIT
