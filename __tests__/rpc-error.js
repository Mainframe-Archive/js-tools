import RPCError, {
  ERROR_MESSAGES,
  isServerError,
  getErrorMessage,
  parseError,
  invalidRequest,
  methodNotFound,
  invalidParams,
  internalError,
} from '../packages/rpc-error'

describe('rpc-error', () => {
  it('sets the code, message and data', () => {
    const err = new RPCError(1000, 'test', 'error')
    expect(err instanceof Error).toBe(true)
    expect(err.code).toBe(1000)
    expect(err.message).toBe('test')
    expect(err.data).toBe('error')
  })

  it('creates an instance using the static fromObject function', () => {
    const err = RPCError.fromObject({ code: 1000, data: 0 })
    expect(err instanceof RPCError).toBe(true)
    expect(err.code).toBe(1000)
    expect(err.message).toBe('Application error')
    expect(err.data).toBe(0)
  })

  it('isServerError() returns whether the code matches a server error or not', () => {
    expect(isServerError(0)).toBe(false)
    expect(isServerError(-32000)).toBe(true)
    expect(isServerError(-32034)).toBe(true)
    expect(isServerError(-32099)).toBe(true)
    expect(isServerError(-33000)).toBe(false)
  })

  it('getErrorMessage() returns the error message for the provided code', () => {
    Object.keys(ERROR_MESSAGES).forEach(code => {
      expect(getErrorMessage(code)).toBe(ERROR_MESSAGES[code])
    })
    expect(getErrorMessage(-32067)).toBe('Server error')
    expect(getErrorMessage(-30000)).toBe('Application error')
  })

  it('provides factory function for protocol errors', () => {
    expect(parseError().code).toBe(-32700)
    expect(invalidRequest().code).toBe(-32600)
    expect(methodNotFound().code).toBe(-32601)
    expect(invalidParams().code).toBe(-32602)
    expect(internalError().code).toBe(-32603)
  })
})
