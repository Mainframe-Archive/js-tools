import { RPCRequest, RPCResponse } from '@mainframe/rpc-base'
import RPCError, {
  ERROR_CODE,
  getErrorMessage,
  invalidParams,
  parseError,
} from '@mainframe/rpc-error'
import Validator from 'fastest-validator'

export type ErrorHandler = <C = any, P = any>(
  ctx: C,
  req: RPCRequest<P>,
  error: Error,
) => void

export type MethodHandler = <C = any, P = any, R = any>(
  ctx: C,
  params: P,
) => R | Promise<R>

export type NotificationHandler = <C = any, P = any>(
  ctx: C,
  req: RPCRequest<P>,
) => void

// Definitions from the fastest-validator are not complete
type ValidationSchema = Record<string, any>

export interface MethodWithParams {
  params?: ValidationSchema | undefined
  handler: MethodHandler
}

export type Methods = Record<string, MethodHandler | MethodWithParams>

type NormalizedMethods = Record<string, MethodHandler>

export interface HandlerParams {
  methods: Methods
  onHandlerError?: ErrorHandler | undefined
  onInvalidMessage?: NotificationHandler | undefined
  onNotification?: NotificationHandler | undefined
  validatorOptions?: any | undefined
}

export type HandlerFunc = <C = any, P = any, R = any, E = any>(
  ctx: C,
  req: RPCRequest<P>,
) => Promise<RPCResponse<R, E>>

export function parseJSON<T = any>(input: string): T {
  try {
    return JSON.parse(input)
  } catch (err) {
    throw parseError()
  }
}

export function createErrorResponse<R, E>(
  id: number | string,
  code: number,
): RPCResponse<R, E> {
  return {
    jsonrpc: '2.0',
    id,
    error: { code, message: getErrorMessage(code) },
  }
}

export function normalizeMethods(
  methods: Methods,
  validatorOptions?: any | undefined,
): NormalizedMethods {
  const v = new Validator(validatorOptions)

  return Object.keys(methods).reduce(
    (acc, name) => {
      const method = methods[name]
      if (typeof method === 'function') {
        acc[name] = method
      } else if (typeof method.handler === 'function') {
        if (method.params == null) {
          acc[name] = method.handler
        } else {
          const check = v.compile(method.params)
          acc[name] = function validatedMethod<C = any, P = any>(
            ctx: C,
            params: P,
          ) {
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
    },
    {} as NormalizedMethods,
  )
}

function defaultOnHandlerError<C = any, P = any>(
  _ctx: C,
  _msg: RPCRequest<P>,
  _error: Error,
): void {}

function defaultOnInvalidMessage<C = any, P = any>(
  ctx: C,
  msg: RPCRequest<P>,
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled invalid message', msg)
}

function defaultOnNotification<C = any, P = any>(
  ctx: C,
  msg: RPCRequest<P>,
): void {
  // eslint-disable-next-line no-console
  console.warn('Unhandled notification', msg)
}

export default function createHandler(params: HandlerParams) {
  const methods = normalizeMethods(params.methods, params.validatorOptions)
  const onHandlerError = params.onHandlerError || defaultOnHandlerError
  const onInvalidMessage = params.onInvalidMessage || defaultOnInvalidMessage
  const onNotification = params.onNotification || defaultOnNotification

  return async function handleMessage<C = any, P = any, R = any, E = any>(
    ctx: C,
    msg: RPCRequest<P>,
  ): Promise<RPCResponse<R, E> | null> {
    const id = msg.id

    if (msg.jsonrpc !== '2.0' || msg.method == null) {
      if (id == null) {
        onInvalidMessage(ctx, msg)
        return null
      }
      return createErrorResponse(id, ERROR_CODE.INVALID_REQUEST)
    }

    if (id == null) {
      onNotification(ctx, msg)
      return null
    }

    const handler = methods[msg.method]
    if (handler == null) {
      return createErrorResponse(id, ERROR_CODE.METHOD_NOT_FOUND)
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
