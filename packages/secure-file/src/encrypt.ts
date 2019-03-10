import {
  EncryptedBox,
  encryptSecretBox,
  decryptSecretBox,
} from '@mainframe/utils-crypto'

import { base64decode, base64encode } from './base64'
import { readSecureFile, writeSecureFile } from './fs'
import {
  EncodedBox,
  EncryptedContents,
  SecureFile,
  SecureFileOpened,
  // seems like the parser doesn't recognise "type" exports
  // eslint-disable-next-line import/named
  KeyExtractor,
} from './types'

export function decodeBox(box: EncodedBox): EncryptedBox {
  return {
    cipher: base64decode(box.cipher),
    nonce: base64decode(box.nonce),
  }
}

export function encodeBox(box: EncryptedBox): EncodedBox {
  return {
    cipher: base64encode(box.cipher),
    nonce: base64encode(box.nonce),
  }
}

export function decryptContents(
  contents: EncryptedContents,
  key: Buffer,
): Buffer | null {
  if (contents.version !== 1 || contents.type !== 'encrypted') {
    throw new Error('Invalid input')
  }
  return decryptSecretBox(decodeBox(contents.encrypted), key)
}

export function encryptContents(data: Buffer, key: Buffer): EncryptedContents {
  return {
    version: 1,
    type: 'encrypted',
    encrypted: encodeBox(encryptSecretBox(data, key)),
  }
}

export async function readEncryptedFile<T = any>(
  path: string,
  keyOrExtractor: Buffer | KeyExtractor,
): Promise<SecureFileOpened<EncryptedContents, T>> {
  const file: SecureFile<EncryptedContents, T> = await readSecureFile(path)
  const key =
    typeof keyOrExtractor === 'function'
      ? await keyOrExtractor(file.metadata)
      : keyOrExtractor
  return { file, opened: decryptContents(file.contents, key) }
}

export async function writeEncryptedFile<T = any>(
  path: string,
  data: Buffer,
  key: Buffer,
  metadata?: T,
): Promise<void> {
  await writeSecureFile(path, encryptContents(data, key), metadata)
}
