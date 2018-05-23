// @flow

export opaque type base64: string = string

export const base64Type = (value: any): base64 => (value: base64)

export const encodeBase64 = (input: Buffer): base64 => {
  return base64Type(input.toString('base64'))
}

export const decodeBase64 = (input: base64): Buffer => {
  return Buffer.from(input, 'base64')
}
