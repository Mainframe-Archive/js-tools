import { uniqueID } from '../packages/utils-id'

describe('utils-id', () => {
  it('uniqueID() generates an unique string', () => {
    const id1 = uniqueID()
    expect(typeof id1).toBe('string')
    const id2 = uniqueID()
    expect(typeof id2).toBe('string')
    expect(id1).not.toBe(id2)
  })
})
