export interface KeyPair {
  publicKey: Buffer
  secretKey: Buffer
}

export interface EncryptedBox {
  cipher: Buffer
  nonce: Buffer
}
