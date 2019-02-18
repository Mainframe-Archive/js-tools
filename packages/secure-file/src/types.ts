export interface EncodedBox {
  cipher: string
  nonce: string
}

export interface EncryptedContents {
  version: 1
  type: 'encrypted'
  encrypted: EncodedBox
}

export interface SignedContents {
  version: 1
  type: 'signed'
  signed: {
    keys: Array<string>
    message: string
  }
}

export type SecureContents = EncryptedContents | SignedContents

export interface SecureFile<C = SecureContents, M = any> {
  version: 1
  contents: C
  metadata?: M
}

export interface EncryptedFile<T = any>
  extends SecureFile<EncryptedContents, T> {}

export interface SignedFile<T = any> extends SecureFile<SignedContents, T> {}

export interface EncryptedFileOpened<T = any>
  extends SecureFileOpened<EncryptedFile<T>> {}

export interface SecureFileOpened<C = SecureContents, M = any> {
  file: SecureFile<C, M>
  opened: Buffer | null
}

export interface SignedFileOpened<T = any>
  extends SecureFileOpened<SignedFile<T>> {}

export type KeyExtractor = <T = any>(metadata?: T) => Promise<Buffer>
