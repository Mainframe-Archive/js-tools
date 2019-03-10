import { RPCErrorObject } from '@mainframe/rpc-base'

export enum ERROR_CODE {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

export const ERROR_MESSAGE: Record<number, string> = {
  [ERROR_CODE.PARSE_ERROR]: 'Parse error',
  [ERROR_CODE.INVALID_REQUEST]: 'Invalid request',
  [ERROR_CODE.METHOD_NOT_FOUND]: 'Method not found',
  [ERROR_CODE.INVALID_PARAMS]: 'Invalid params',
  [ERROR_CODE.INTERNAL_ERROR]: 'Internal error',
}

export function isServerError(code: number): boolean {
  return -32000 >= code && code >= -32099
}

export function getErrorMessage(code: number): string {
  return (
    ERROR_MESSAGE[code] ||
    (isServerError(code) ? 'Server error' : 'Application error')
  )
}

export default class RPCError<T = any> extends Error {
  public static fromObject<D = any>(err: RPCErrorObject<D>): RPCError<D> {
    return new RPCError<D>(err.code, err.message, err.data)
  }

  public code: number
  public data: T | undefined
  public message: string

  public constructor(
    code: number,
    message?: string | undefined,
    data?: T | undefined,
  ) {
    super()
    this.code = code
    this.data = data
    this.message = message || getErrorMessage(code)
  }

  public toObject(): RPCErrorObject<T> {
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    }
  }
}

function createErrorFactory(code: ERROR_CODE): <T>(data?: T) => RPCError<T> {
  const message = ERROR_MESSAGE[code]
  return function createError<T = any>(data?: T) {
    return new RPCError<T>(code, message, data)
  }
}

export const parseError = createErrorFactory(ERROR_CODE.PARSE_ERROR)
export const invalidRequest = createErrorFactory(ERROR_CODE.INVALID_REQUEST)
export const methodNotFound = createErrorFactory(ERROR_CODE.METHOD_NOT_FOUND)
export const invalidParams = createErrorFactory(ERROR_CODE.INVALID_PARAMS)
export const internalError = createErrorFactory(ERROR_CODE.INTERNAL_ERROR)
