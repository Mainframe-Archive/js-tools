// @flow

import { encodeBase64, decodeBase64 } from '@mainframe/utils-base64'
import {
  encryptSecretBox,
  decryptSecretBox,
  type EncryptedBox, // eslint-disable-line import/named
} from '@mainframe/utils-crypto'

import { readSecureFile, writeSecureFile } from './fs'
import type {
  EncodedBox,
  EncryptedContents,
  SecureContents,
  SecureFile,
  OpenedSecureFile,
  KeyExtractor,
} from './types'

export const decodeBox = (box: EncodedBox): EncryptedBox => ({
  cipher: decodeBase64(box.cipher),
  nonce: decodeBase64(box.nonce),
})

export const encodeBox = (box: EncryptedBox): EncodedBox => ({
  cipher: encodeBase64(box.cipher),
  nonce: encodeBase64(box.nonce),
})

export const decryptContents = (
  contents: EncryptedContents,
  key: Buffer,
): ?Buffer => {
  if (contents.version !== 1 || contents.type !== 'encrypted') {
    throw new Error('Invalid input')
  }
  return decryptSecretBox(decodeBox(contents.encrypted), key)
}

export const encryptContents = (
  data: Buffer,
  key: Buffer,
): EncryptedContents => ({
  version: 1,
  type: 'encrypted',
  encrypted: encodeBox(encryptSecretBox(data, key)),
})

export const readEncryptedFile = async (
  path: string,
  keyOrExtractor: Buffer | KeyExtractor,
): Promise<OpenedSecureFile<EncryptedContents>> => {
  // $FlowFixMe: file type
  const file: SecureFile<EncryptedContents> = await readSecureFile(path)
  const key =
    typeof keyOrExtractor === 'function'
      ? await keyOrExtractor(file.metadata)
      : keyOrExtractor
  return { file, opened: decryptContents(file.contents, key) }
}

export const writeEncryptedFile = (
  path: string,
  data: Buffer,
  key: Buffer,
  metadata?: Object,
): Promise<void> => {
  return writeSecureFile(path, encryptContents(data, key), metadata)
}
