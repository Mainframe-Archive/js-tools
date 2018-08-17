// @flow

import RPCError, {
  ERROR_CODES,
  getErrorMessage,
  invalidParams,
  parseError,
} from '@mainframe/rpc-error'
import Validator from 'fastest-validator'

export type IncomingMessage = {
  jsonrpc: '2.0',
  method: string,
  id?: number | string,
  params?: ?any,
}

export type OutgoingErrorMessage = {
  jsonrpc: '2.0',
  id: number | string,
  error: {
    code: number,
    message: string,
    data?: ?any,
  },
}

export type OutgoingResultMessage = {
  jsonrpc: '2.0',
  id: number | string,
  result: ?any,
}

export type OutgoingMessage = OutgoingErrorMessage | OutgoingResultMessage

export type ErrorHandler = (
  ctx: any,
  msg: IncomingMessage,
  error: Error,
) => void

export type MethodHandler = (ctx: any, params: Object) => ?any

export type NotificationHandler = (ctx: any, msg: IncomingMessage) => void

export type MethodWithParams = {
  params?: ?Object,
  handler: MethodHandler,
}

export type Methods = {
  [name: string]: MethodHandler | MethodWithParams,
}

type NormalizedMethods = {
  [name: string]: MethodHandler,
}

export type HandlerParams = {
  methods: Methods,
  onHandlerError?: ?ErrorHandler,
  onInvalidMessage?: ?NotificationHandler,
  onNotification?: ?NotificationHandler,
  validatorOptions?: ?Object,
}

export type HandlerFunc = (
  ctx: any,
  msg: IncomingMessage,
) => Promise<?OutgoingMessage>

export const parseJSON = (input: string): Object => {
  try {
    return JSON.parse(input)
  } catch (err) {
    throw parseError()
  }
}

export const createErrorMessage = (
  id: number | string,
  code: $Values<typeof ERROR_CODES>,
) => ({
  jsonrpc: '2.0',
  id,
  error: { code, message: getErrorMessage(code) },
})

export const normalizeMethods = (
  methods: Methods,
  validatorOptions?: ?Object,
): NormalizedMethods => {
  const v = new Validator(validatorOptions)

  return Object.keys(methods).reduce((acc, name) => {
    const method = methods[name]
    if (typeof method === 'function') {
      acc[name] = method
    } else if (typeof method.handler === 'function') {
      if (method.params == null) {
        acc[name] = method.handler
      } else {
        const check = v.compile(method.params)
        acc[name] = (ctx: any, params: Object) => {
          const checked = check(params)
          if (checked === true) {
            return method.handler(ctx, params)
          } else {
            throw invalidParams(checked)
          }
        }
      }
    } else {
      throw new Error(
        `Unexpected definition for method "${name}": method should be a function or an object with "params" Object and "handler" function.`,
      )
    }
    return acc
  }, {})
}

const defaultOnHandlerError = (
  _ctx: any,
  _msg: IncomingMessage,
  _error: Error,
) => {}

const defaultOnInvalidMessage = (ctx: any, msg: IncomingMessage) => {
  // eslint-disable-next-line no-console
  console.warn('Unhandled invalid message', msg)
}

const defaultOnNotification = (ctx: any, msg: IncomingMessage) => {
  // eslint-disable-next-line no-console
  console.warn('Unhandled notification', msg)
}

export default (params: HandlerParams) => {
  const methods = normalizeMethods(params.methods)
  const onHandlerError = params.onHandlerError || defaultOnHandlerError
  const onInvalidMessage = params.onInvalidMessage || defaultOnInvalidMessage
  const onNotification = params.onNotification || defaultOnNotification

  return async (ctx: any, msg: IncomingMessage): Promise<?OutgoingMessage> => {
    const id = msg.id

    if (msg.jsonrpc !== '2.0' || msg.method == null) {
      if (id == null) {
        onInvalidMessage(ctx, msg)
        return
      }
      return createErrorMessage(id, ERROR_CODES.INVALID_REQUEST)
    }

    if (id == null) {
      onNotification(ctx, msg)
      return
    }

    const handler = methods[msg.method]
    if (handler == null) {
      return createErrorMessage(id, ERROR_CODES.METHOD_NOT_FOUND)
    }

    try {
      const result = await handler(ctx, msg.params || {})
      return { jsonrpc: '2.0', id, result }
    } catch (err) {
      onHandlerError(ctx, msg, err)
      let error
      if (err instanceof RPCError) {
        error = err.toObject()
      } else {
        const code = err.code || -32000 // Server error
        error = { code, message: err.message || getErrorMessage(code) }
      }
      return { jsonrpc: '2.0', id, error }
    }
  }
}
