# rpc-error

Error class and utilities for JSON-RPC errors.

## Installation

```sh
yarn add @mainframe/rpc-error
```

## Usage

```js
import RPCError, { parseError, methodNotFound } from '@mainframe/rpc-error'

const error1 = parseError()
const error2 = methodNotFound('get_user')
const error3 = new RPCError(-32600) // Invalid request
const error4 = new RPCError(1000, 'Custom app error', { user: 'alice' })
```

## Types

### ErrorObject

JSON-RPC Error object type:

```js
type ErrorObject = {
  code: number,
  message?: ?string,
  data?: ?any,
}
```

## API

### new RPCError()

**Arguments**

1.  `code: number`
1.  `message?: string`: will be set based on the `code` when not provided
1.  `data?: ?any`: additional error data

### .toObject()

**Returns** `ErrorObject`

### RPCError.fromObject()

**Arguments**

1.  `error: ErrorObject`

**Returns** `RPCError` instance

### isServerError()

**Arguments**

1.  `code: number`

**Returns** `boolean`

### getErrorMessage()

**Arguments**

1.  `code: number`

**Returns** `string`

### parseError()

**Arguments**

1.  `data?: ?any`

**Returns** `RPCError` instance with code `-32700`

### invalidRequest()

**Arguments**

1.  `data?: ?any`

**Returns** `RPCError` instance with code `-32600`

### methodNotFound()

**Arguments**

1.  `data?: ?any`

**Returns** `RPCError` instance with code `-32601`

### invalidParams()

**Arguments**

1.  `data?: ?any`

**Returns** `RPCError` instance with code `-32602`

### internalError()

**Arguments**

1.  `data?: ?any`

**Returns** `RPCError` instance with code `-32603`

## License

MIT
