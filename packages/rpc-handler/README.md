# rpc-handler

JSON-RPC messages handler.

## Installation

```sh
yarn add @mainframe/rpc-handler
```

## Usage

```js
import createHandler from '@mainframe/rpc-handler'

const handle = createHandler({
  methods: {
    hello: {
      params: {
        name: 'string'
      },
      handler(ctx, params) => `hello ${params.name}`,
    },
    ping: () => 'pong',
  },
})

const context = {}

const incomingMessage = {
  jsonrpc: '2.0',
  id: 'test',
  method: 'hello',
  params: {
    name: 'bob',
  },
}

const outgoingMessage = await handle(context, incomingMessage)
// outgoingMessage = {jsonrpc: '2.0', id: 'test', result: 'hello bob'}
```

## Types

### IncomingMessage

Expected JSON-RPC incoming (request) message:

```js
type IncomingMessage = {
  jsonrpc: '2.0',
  method: string,
  id?: number | string,
  params?: ?any,
}
```

### OutgoingErrorMessage

```js
type OutgoingErrorMessage = {
  jsonrpc: '2.0',
  id: number | string,
  error: {
    code: number,
    message: string,
    data?: ?any,
  },
}
```

### OutgoingResultMessage

```js
type OutgoingResultMessage = {
  jsonrpc: '2.0',
  id: number | string,
  result: ?any,
}
```

### OutgoingMessage

JSON-RPC outgoing (response) message:

```js
type OutgoingMessage = OutgoingErrorMessage | OutgoingResultMessage
```

### MethodHandler

```js
type MethodHandler = (ctx: any, params: Object) => ?any
```

### NotificationHandler

```js
type NotificationHandler = (ctx: any, msg: IncomingMessage) => void
```

### MethodWithParams

```js
type MethodWithParams = {
  params?: ?Object,
  handler: MethodHandler,
}
```

### Methods

```js
type Methods = {
  [name: string]: MethodHandler | MethodWithParams,
}
```

### HandlerParams

```js
type HandlerParams = {
  methods: Methods,
  onInvalidMessage?: ?NotificationHandler,
  onNotification?: ?NotificationHandler,
  validatorOptions?: ?Object,
}
```

### HandlerFunc

```js
type HandlerFunc = (ctx: any, msg: IncomingMessage) => Promise<?OutgoingMessage>
```

## API

### createHandler()

**Default export of the library**

**Arguments**

1.  `params: HandlerParams`

**Returns** `HandlerFunc`

### parseJSON()

Tries to parse a JSON string, or throws a RPCError with code `-32700` (parse error)

**Arguments**

1.  `input: string`

**Returns** `Object`

## License

MIT
