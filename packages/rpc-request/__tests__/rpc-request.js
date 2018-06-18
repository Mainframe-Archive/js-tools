import RPCError from '../../rpc-error'
import RequestRPC from '..'

describe('rpc-request', () => {
  it('calls the _fetch() method with the required parameters', async () => {
    const fetch = jest.fn(async () => ({ result: 'OK' }))
    const rpc = new RequestRPC(fetch)
    const res = await rpc.request('test_method', 'hello')
    expect(fetch.mock.calls).toHaveLength(1)
    expect(fetch.mock.calls[0][0]).toEqual({
      id: expect.any(String),
      jsonrpc: '2.0',
      method: 'test_method',
      params: 'hello',
    })
    expect(res).toBe('OK')
  })

  it('throws a RPCError if the response payload contains an error', async () => {
    const fetch = jest.fn(async () => ({
      error: { code: 1, message: 'failed' },
    }))
    const rpc = new RequestRPC(fetch)
    expect(rpc.request('test_method', 'hello')).rejects.toThrow(RPCError)
  })
})
