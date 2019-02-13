// @flow

import { Transform } from 'stream'
import sodium from 'sodium-universal'

import { secureRandomBytes } from './random'

export const SECRETSTREAM_KEYBYTES: number =
  sodium.crypto_secretstream_xchacha20poly1305_KEYBYTES
export const SECRETSTREAM_ABYTES: number =
  sodium.crypto_secretstream_xchacha20poly1305_ABYTES
export const SECRETSTREAM_HEADERBYTES: number =
  sodium.crypto_secretstream_xchacha20poly1305_HEADERBYTES

export const SECRETSTREAM_TAG_PUSH: Buffer =
  sodium.crypto_secretstream_xchacha20poly1305_TAG_PUSH
export const SECRETSTREAM_TAG_MESSAGE: Buffer =
  sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE
export const SECRETSTREAM_TAG_FINAL: Buffer =
  sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
export const SECRETSTREAM_TAG_REKEY: Buffer =
  sodium.crypto_secretstream_xchacha20poly1305_TAG_REKEY

export const SECRETSTREAM_CHUNKBYTES_CIPHERTEXT = 16 * 1024 // 16kb
export const SECRETSTREAM_CHUNKBYTES_PLAINTEXT =
  SECRETSTREAM_CHUNKBYTES_CIPHERTEXT - SECRETSTREAM_ABYTES

export const createSecretStreamKey = (): Buffer => {
  return secureRandomBytes(SECRETSTREAM_KEYBYTES)
}

const createCiphertextBuffer = (): Buffer => {
  return Buffer.alloc(SECRETSTREAM_CHUNKBYTES_CIPHERTEXT)
}

const createPlaintextBuffer = (): Buffer => {
  return Buffer.alloc(SECRETSTREAM_CHUNKBYTES_PLAINTEXT)
}

const toBuffer = (
  bufferOrString: Buffer | string,
  encoding: string,
): Buffer => {
  return typeof bufferOrString === 'string'
    ? // $FlowFixMe: type check
      Buffer.from(bufferOrString, encoding)
    : bufferOrString
}

type CallbackFunc = (err: ?Error) => void

export class DecryptStream extends Transform {
  _buffer: Buffer
  _key: Buffer
  _state: ?Buffer

  constructor(key: Buffer) {
    super()
    this._key = key
    this._buffer = Buffer.alloc(0)
  }

  _transform(c: Buffer | string, encoding: string, cb: CallbackFunc) {
    const chunk = toBuffer(c, encoding)
    let ciphertext
    if (this._state == null) {
      const header = chunk.slice(0, SECRETSTREAM_HEADERBYTES)
      ciphertext = chunk.slice(SECRETSTREAM_HEADERBYTES)

      this._state = sodium.crypto_secretstream_xchacha20poly1305_state_new()
      sodium.crypto_secretstream_xchacha20poly1305_init_pull(
        this._state,
        header,
        this._key,
      )
    } else {
      ciphertext = chunk
    }

    let buffer = Buffer.concat([this._buffer, ciphertext])
    while (buffer.length >= SECRETSTREAM_CHUNKBYTES_CIPHERTEXT) {
      const plaintext = createPlaintextBuffer()
      sodium.crypto_secretstream_xchacha20poly1305_pull(
        this._state,
        plaintext,
        SECRETSTREAM_TAG_PUSH,
        buffer.slice(0, SECRETSTREAM_CHUNKBYTES_CIPHERTEXT),
      )
      this.push(plaintext)
      buffer = buffer.slice(SECRETSTREAM_CHUNKBYTES_CIPHERTEXT)
    }
    this._buffer = buffer

    cb()
  }

  _flush(cb: CallbackFunc) {
    if (this._buffer.length >= SECRETSTREAM_ABYTES) {
      const plaintext = Buffer.alloc(this._buffer.length - SECRETSTREAM_ABYTES)
      sodium.crypto_secretstream_xchacha20poly1305_pull(
        this._state,
        plaintext,
        SECRETSTREAM_TAG_FINAL,
        this._buffer,
      )
      this._buffer = Buffer.alloc(0)
      this.push(plaintext)
    }
    cb()
  }
}

export const createDecryptStream = (key: Buffer) => new DecryptStream(key)

export class EncryptStream extends Transform {
  _buffer: Buffer
  _header: ?Buffer
  _state: Buffer

  constructor(key: Buffer) {
    super()
    this._buffer = Buffer.alloc(0)
    this._header = Buffer.alloc(SECRETSTREAM_HEADERBYTES)
    this._state = sodium.crypto_secretstream_xchacha20poly1305_state_new()
    sodium.crypto_secretstream_xchacha20poly1305_init_push(
      this._state,
      this._header,
      key,
    )
  }

  _transform(c: Buffer | string, encoding: string, cb: CallbackFunc) {
    if (this._header !== null) {
      this.push(this._header)
      this._header = null
    }

    let buffer = Buffer.concat([this._buffer, toBuffer(c, encoding)])
    while (buffer.length >= SECRETSTREAM_CHUNKBYTES_PLAINTEXT) {
      const ciphertext = createCiphertextBuffer()
      sodium.crypto_secretstream_xchacha20poly1305_push(
        this._state,
        ciphertext,
        buffer.slice(0, SECRETSTREAM_CHUNKBYTES_PLAINTEXT),
        null,
        SECRETSTREAM_TAG_PUSH,
      )
      this.push(ciphertext)
      buffer = buffer.slice(SECRETSTREAM_CHUNKBYTES_PLAINTEXT)
    }
    this._buffer = buffer

    cb()
  }

  _flush(cb: CallbackFunc) {
    const ciphertext = Buffer.alloc(this._buffer.length + SECRETSTREAM_ABYTES)
    sodium.crypto_secretstream_xchacha20poly1305_push(
      this._state,
      ciphertext,
      this._buffer,
      null,
      SECRETSTREAM_TAG_FINAL,
    )
    this._buffer = Buffer.alloc(0)
    this.push(ciphertext)
    cb()
  }
}

export const createEncryptStream = (key: Buffer) => new EncryptStream(key)
