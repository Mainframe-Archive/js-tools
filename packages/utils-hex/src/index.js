// @flow

export opaque type hex: string = string // Hex string prefixed with `0x`

export const hexType = (value: string): hex => (value: hex)

export const hexEmpty = hexType('0x')

export const encodeHex = (
  input: string,
  from?: buffer$Encoding = 'utf8',
): hex => hexType('0x' + Buffer.from(input, from).toString('hex'))

export const decodeHex = (value: hex, to: buffer$Encoding = 'utf8'): string => {
  return Buffer.from(value.substr(2), 'hex').toString(to)
}
