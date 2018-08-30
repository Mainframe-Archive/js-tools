// @flow

import BaseError from 'es6-error'

// JSON-RPC Error object type
export type ErrorObject = {
  code: number,
  message?: ?string,
  data?: ?any,
}

export const ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
}

export const ERROR_MESSAGES = {
  '-32700': 'Parse error',
  '-32600': 'Invalid request',
  '-32601': 'Method not found',
  '-32602': 'Invalid params',
  '-32603': 'Internal error',
}

export const isServerError = (code: number): boolean => {
  return -32000 >= code && code >= -32099
}

export const getErrorMessage = (code: number): string => {
  return (
    ERROR_MESSAGES[code] ||
    (isServerError(code) ? 'Server error' : 'Application error')
  )
}

export default class RPCError extends BaseError {
  static fromObject(err: ErrorObject): RPCError {
    return new RPCError(err.code, err.message, err.data)
  }

  code: number
  data: ?any
  message: string

  constructor(code: number, message?: ?string, data?: ?any) {
    super()
    this.code = code
    this.data = data
    this.message = message || getErrorMessage(code)
  }

  toObject(): ErrorObject {
    return {
      code: this.code,
      data: this.data,
      message: this.message,
    }
  }
}

const createError = (key: $Keys<typeof ERROR_CODES>) => {
  const code = ERROR_CODES[key]
  const message = ERROR_MESSAGES[code]
  return (data?: ?any) => new RPCError(code, message, data)
}

export const parseError = createError('PARSE_ERROR')
export const invalidRequest = createError('INVALID_REQUEST')
export const methodNotFound = createError('METHOD_NOT_FOUND')
export const invalidParams = createError('INVALID_PARAMS')
export const internalError = createError('INTERNAL_ERROR')
