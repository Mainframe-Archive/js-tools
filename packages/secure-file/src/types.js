// @flow

import type { base64 } from '@mainframe/utils-base64'

export type EncodedBox = {
  cipher: base64,
  nonce: base64,
}

export type EncryptedContents = {
  version: 1,
  type: 'encrypted',
  encrypted: EncodedBox,
}

export type SignedContents = {
  version: 1,
  type: 'signed',
  signed: {
    keys: Array<base64>,
    message: base64,
  },
}

export type SecureContents = EncryptedContents | SignedContents

export type SecureFile<T = SecureContents> = {
  version: 1,
  contents: T,
  metadata?: Object,
}

export type OpenedSecureFile<T> = {
  file: SecureFile<T>,
  opened: ?Buffer,
}

export type KeyExtractor = (metadata?: Object) => Promise<Buffer>
