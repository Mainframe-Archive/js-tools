// @flow

export opaque type hex: string = string // Hex string prefixed with `0x`

export const hexType = (value: string): hex => (value: hex)

export const hexEmpty = hexType('0x')

export const encodeHex = (
  input: string,
  from?: buffer$Encoding = 'utf8',
): hex => hexType('0x' + Buffer.from(input, from).toString('hex'))

export const decodeHex = (hex: hex, to: buffer$Encoding = 'utf8'): string => {
  return Buffer.from(hex.substr(2), 'hex').toString(to)
}
