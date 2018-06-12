# transport-web3

Web3 transport for browser as a [RxJS `Subject`](http://reactivex.io/rxjs/class/es6/Subject.js~Subject.html).

## Installation

```sh
yarn add @mainframe/transport-web3
```

## Usage

```js
import web3Transport from '@mainframe/transport-web3'

const transport = web3Transport('http://localhost:8500')

transport.subcribe(console.log)
transport.next({ jsonrpc: '2.0', id: 1, method: 'web3_clientVersion' })
```

## API

### web3Transport()

**Arguments**

1.  `url?: string`: optional HTTP endpoint. When not provided, `window.web3.currentProvider` will be used if available.

**Returns** `Rx.Subject<Object>`

## License

MIT
