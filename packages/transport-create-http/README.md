# transport-create-http

HTTP transport factory used by [`transport-http-browser`]('../transport-http-browser') and [`transport-http-node`]('../transport-http-node').

Throws `HTTPError` when the request fails.

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

### createTransport() (default export)

**Arguments**

1.  `fetch: (req: Request) => Response`: function implementing the [`Fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) interfaces.

**Returns** `(data: Object) => Promise<any>`

### HTTPError class

**Arguments**

1.  `status: number`: HTTP status code
1.  `message: string`: error message

**Properties**

- `status: number`: HTTP status code
- `message: string`: error message

## License

MIT
