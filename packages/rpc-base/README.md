# rpc-base

Base class to handle JSON-RPC 2.0 calls, used by [`rpc-request`](../rpc-request) and [`rpc-stream`](../rpc-stream).

## Installation

```sh
yarn add @mainframe/rpc-base
```

## Usage

```js
import BaseRPC from '@mainframe/rpc-base'

class MyRPC extends BaseRPC {
  request(...params: any): Promise<any> {
    // ...
  }
}
```

## API

### new BaseRPC()

**Arguments**

1.  `canSubscribe: boolean = false`: whether subscription calls (using a stateful connection) are supported by the implementation or not.

### .canSubscribe

**Returns** `boolean`

### .createId()

**Returns** `string`: an unique ID for RPC calls.

### .request()

**⚠️ Must be implemented by extending classes**\

**Returns** `Promise<any>`

## License

MIT
