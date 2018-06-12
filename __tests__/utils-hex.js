import { hexEmpty, encodeHex, decodeHex } from '../packages/utils-hex'

describe('utils-hex', () => {
  it('hexEmpty is an empty hex string', () => {
    expect(hexEmpty).toBe('0x')
  })

  it('encodeHex() encodes an utf8 string to hex string', () => {
    expect(encodeHex('hello')).toBe('0x68656c6c6f')
  })

  it('decodeHex() decodes an hex string to utf8 string', () => {
    expect(decodeHex('0x74657374')).toBe('test')
  })
})
