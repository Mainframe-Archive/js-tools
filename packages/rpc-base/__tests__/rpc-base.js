import BaseRPC from '..'

describe('rpc-base', () => {
  it('has a canSubscribe getter depending on constructor value', () => {
    const withSubscribe = new BaseRPC(true)
    expect(withSubscribe.canSubscribe).toBe(true)
    const withoutSubscribe = new BaseRPC()
    expect(withoutSubscribe.canSubscribe).toBe(false)
  })

  it('has a createId() method generating a random string', () => {
    const rpc = new BaseRPC()
    const id1 = rpc.createId()
    const id2 = rpc.createId()
    expect(typeof id1).toBe('string')
    expect(id1).not.toBe(id2)
  })
})
