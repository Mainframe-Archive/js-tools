# rpc-request

Class extending [`rpc-base`](../rpc-base) to handle stateless JSON-RPC 2.0 calls.

See [`transport-create-http`](../transport-create-http), [`transport-http-browser`](../transport-http-browser), [`transport-http-node`](../transport-http-node) and [`transport-web3`](../transport-web3) for possible transports and [`rpc-stream`](../rpc-stream) to handle stateful JSON-RPC 2.0 calls.

## Installation

```sh
yarn add @mainframe/rpc-request
```

## Usage

```js
import RequestRPC from '@mainframe/rpc-request'
import httpTransport from '@mainframe/transport-http-node'

class MyAPI extends RequestRPC {
  constructor(url: string) {
    super(httpTransport(url))
  }

  getUser(id: string): Promise<Object> {
    return this.request('getUser', [id])
  }
}

const api = new MyAPI('http://my-api-url')
api.getUser('1234')
```

## API

See [the `BaseRPC` API](../rpc-base/README.md#api) for inherited methods and properties.

### new RequestRPC()

**Arguments**

1.  `fetch: (request: Object) => Promise<any>`: function making the server call using the JSON-RPC request Object and returning the response.

### .request()

**Arguments**

1.  `method: string`
1.  `params: Array<any>`

**Returns** `Promise<any>`

## License

MIT
