// @flow

export type KeyPair = {
  publicKey: Buffer,
  secretKey: Buffer,
}

export type EncryptedBox = {
  cipher: Buffer,
  nonce: Buffer,
}
