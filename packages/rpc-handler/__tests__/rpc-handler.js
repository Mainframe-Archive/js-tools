import RPCError, { ERROR_CODES, ERROR_MESSAGES } from '@mainframe/rpc-error'

import createHandler, {
  createErrorMessage,
  normalizeMethods,
  parseJSON,
} from '..'

describe('rpc-handler', () => {
  it('parseJSON() returns the parsed object', () => {
    expect(parseJSON('{"ok":true}')).toEqual({ ok: true })
  })

  it('parseJSON() throws a parse error RPCError if parsing fails', () => {
    try {
      parseJSON('{"ok":false')
    } catch (err) {
      const code = ERROR_CODES.PARSE_ERROR
      expect(err instanceof RPCError).toBe(true)
      expect(err.code).toBe(code)
      expect(err.message).toBe(ERROR_MESSAGES[code])
    }
  })

  it('createErrorMessage() returns an OutgoingErrorMessage object with the error message', () => {
    const code = ERROR_CODES.INVALID_PARAMS
    expect(createErrorMessage('test', code)).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: {
        code,
        message: ERROR_MESSAGES[code],
      },
    })
  })

  it('normalizeMethods() normalizes the method handlers and parameters', () => {
    const firstHandler = jest.fn(() => 'ok')
    const secondHandler = jest.fn((_, { name }) => `hello ${name}`)

    const methods = normalizeMethods({
      first: firstHandler,
      second: {
        params: {
          name: { type: 'string' },
        },
        handler: secondHandler,
      },
    })

    expect(methods.first()).toBe('ok')
    expect(methods.second({}, { name: 'bob' })).toBe('hello bob')

    expect(() => methods.second({}, {})).toThrow(RPCError)
    try {
      methods.second({}, {})
    } catch (err) {
      const code = ERROR_CODES.INVALID_PARAMS
      expect(err.code).toBe(code)
      expect(err.message).toBe(ERROR_MESSAGES[code])
      expect(err.data).toEqual([
        {
          type: 'required',
          expected: undefined,
          actual: undefined,
          field: 'name',
          message: "The 'name' field is required!",
        },
      ])
    }
  })

  it('normalizeMethods() throws if a method is not a function or an object with an "handler" function', () => {
    expect(() => normalizeMethods({ fails: 1 })).toThrow(
      'Unexpected definition for method "fails": method should be a function or an object with "params" Object and "handler" function.',
    )
    expect(() =>
      normalizeMethods({
        ok: () => {},
        objectFails: {
          nohandler: true,
        },
      }),
    ).toThrow(
      'Unexpected definition for method "objectFails": method should be a function or an object with "params" Object and "handler" function.',
    )
  })

  it('createHandler() handles invalid "jsonrpc" key', async () => {
    const code = ERROR_CODES.INVALID_REQUEST
    const onInvalidMessage = jest.fn()
    const handle = createHandler({ methods: {}, onInvalidMessage })

    const res1 = await handle({ ctx: true }, { method: 'test' })
    expect(res1).toBeUndefined()

    const res2 = await handle({}, { jsonrpc: '2', id: 'test', method: 'test' })
    expect(res2).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: { code, message: ERROR_MESSAGES[code] },
    })

    expect(onInvalidMessage.mock.calls).toHaveLength(1)
    expect(onInvalidMessage.mock.calls[0]).toEqual([
      { ctx: true },
      { method: 'test' },
    ])
  })

  it('createHandler() handles invalid "method" key', async () => {
    const code = ERROR_CODES.INVALID_REQUEST
    const onInvalidMessage = jest.fn()
    const handle = createHandler({ methods: {}, onInvalidMessage })

    const res1 = await handle({ ctx: true }, { jsonrpc: '2.0' })
    expect(res1).toBeUndefined()

    const res2 = await handle({}, { jsonrpc: '2.0', id: 'test' })
    expect(res2).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: { code, message: ERROR_MESSAGES[code] },
    })

    expect(onInvalidMessage.mock.calls).toHaveLength(1)
    expect(onInvalidMessage.mock.calls[0]).toEqual([
      { ctx: true },
      { jsonrpc: '2.0' },
    ])
  })

  it('createHandler() handles notifications', async () => {
    const onNotification = jest.fn()
    const handle = createHandler({ methods: {}, onNotification })
    const res = await handle({ ctx: true }, { jsonrpc: '2.0', method: 'test' })
    expect(res).toBeUndefined()
    expect(onNotification.mock.calls).toHaveLength(1)
    expect(onNotification.mock.calls[0]).toEqual([
      { ctx: true },
      { jsonrpc: '2.0', method: 'test' },
    ])
  })

  it('createHandler() handles not found methods', async () => {
    const code = ERROR_CODES.METHOD_NOT_FOUND
    const handle = createHandler({ methods: {} })
    const res = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'test', method: 'test' },
    )
    expect(res).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      error: { code, message: ERROR_MESSAGES[code] },
    })
  })

  it('createHandler() handles successful handler return', async () => {
    const handler = jest.fn((ctx, { name }) => `hello ${name}`)
    const handle = createHandler({
      methods: {
        test: {
          params: {
            name: 'string',
          },
          handler,
        },
      },
    })
    const res = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'test', method: 'test', params: { name: 'bob' } },
    )
    expect(res).toEqual({
      jsonrpc: '2.0',
      id: 'test',
      result: 'hello bob',
    })
  })

  it('createHandler() handles errors from method handlers', async () => {
    const onHandlerError = jest.fn()
    const paramErrorHandler = jest.fn()
    const handle = createHandler({
      methods: {
        param_error: {
          params: {
            name: 'string',
          },
          handler: paramErrorHandler,
        },
        rpc_error: {
          handler: () => {
            throw new RPCError(1000, 'Custom error message')
          },
        },
        js_error_no_code: () => {
          throw new Error('Error message')
        },
        js_error_with_code: () => {
          const err = new Error('Error message')
          err.code = 1000
          throw err
        },
        js_error_no_message: () => {
          throw new Error()
        },
      },
      onHandlerError,
    })

    const paramsErrorCode = ERROR_CODES.INVALID_PARAMS
    const paramsErrorRes = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'params', method: 'param_error' },
    )
    expect(paramsErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'params',
      error: {
        code: paramsErrorCode,
        message: ERROR_MESSAGES[paramsErrorCode],
        data: [
          {
            type: 'required',
            expected: undefined,
            actual: undefined,
            field: 'name',
            message: "The 'name' field is required!",
          },
        ],
      },
    })
    expect(paramErrorHandler).not.toHaveBeenCalled()

    const rpcErrorRes = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'rpc', method: 'rpc_error' },
    )
    expect(rpcErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'rpc',
      error: {
        code: 1000,
        message: 'Custom error message',
      },
    })

    const jsNoCodeErrorRes = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'js_no_code', method: 'js_error_no_code' },
    )
    expect(jsNoCodeErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'js_no_code',
      error: {
        code: -32000,
        message: 'Error message',
      },
    })

    const jsWithCodeErrorRes = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'js_with_code', method: 'js_error_with_code' },
    )
    expect(jsWithCodeErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'js_with_code',
      error: {
        code: 1000,
        message: 'Error message',
      },
    })

    const jsNoMessageErrorRes = await handle(
      { ctx: true },
      { jsonrpc: '2.0', id: 'js_no_message', method: 'js_error_no_message' },
    )
    expect(jsNoMessageErrorRes).toEqual({
      jsonrpc: '2.0',
      id: 'js_no_message',
      error: {
        code: -32000,
        message: 'Server error',
      },
    })

    expect(onHandlerError).toHaveBeenCalledTimes(5)
  })
})
