# transport-create-http

HTTP transport factory. Used by [`transport-http-browser`]('../transport-http-browser') and [`transport-http-node`]('../transport-http-node').

## Installation

```sh
yarn add @mainframe/transport-create-http
```

## Usage

```js
import createTransport from '@mainframe/transport-create-http'

const request = createTransport(window.fetch)('http://localhost')

request({ hello: 'transport' }).then(console.log)
```

## API

### createTransport()

**Arguments**

1.  `fetch: (req: Request) => Response`: function implementing the [`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) interfaces.

**Returns** `(data: Object) => Promise<any>`

## License

MIT
