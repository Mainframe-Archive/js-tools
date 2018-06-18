import { encodeBase64, decodeBase64 } from '..'

describe('utils-base64', () => {
  const test = Buffer.from('test')

  it('encodeBase64() encodes a Buffer to a base64 string', () => {
    expect(encodeBase64(test)).toBe('dGVzdA==')
  })

  it('decodeBase64() decodes a base64 string to a Buffer', () => {
    expect(decodeBase64('dGVzdA==').equals(test)).toBe(true)
  })
})
