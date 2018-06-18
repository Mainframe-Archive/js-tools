import { Readable } from 'stream'

import {
  BOX_PUBLICKEYBYTES,
  BOX_SECRETKEYBYTES,
  BOX_SEEDBYTES,
  GENERICHASH_BYTES,
  GENERICHASH_BYTES_MIN,
  PASSWORDHASH_MEMLIMIT_MIN,
  PASSWORDHASH_OPSLIMIT_MIN,
  PASSWORDHASH_SALTBYTES,
  SECRETBOX_KEYBYTES,
  SECRETBOX_NONCEBYTES,
  SIGN_BYTES,
  SIGN_PUBLICKEYBYTES,
  SIGN_SECRETKEYBYTES,
  SIGN_SEEDBYTES,
  createBoxKeyPair,
  createBoxKeyPairFromSign,
  createBoxPublicFromSign,
  createPasswordHashSalt,
  createSecretBoxKey,
  createSecretBoxKeyFromPassword,
  createSignKeyPair,
  decryptBox,
  decryptSecretBox,
  encryptBox,
  encryptSecretBox,
  getSignature,
  hash,
  hashPassword,
  hashStream,
  openSigned,
  randomBytes,
  secureRandomBytes,
  sign,
  verifySignature,
} from '..'

class StreamToRead extends Readable {
  constructor(data) {
    super()
    this._chunks = data.split(' ').map(Buffer.from)
    this._index = 0
  }

  _read() {
    const i = this._index++
    if (i > this._chunks.length) {
      this.push(null)
    } else {
      this.push(this._chunks[i])
    }
  }
}

describe('utils-crypto', () => {
  describe('box', () => {
    it('createBoxKeyPair() creates a KeyPair for encryption', () => {
      const kp = createBoxKeyPair()
      expect(Buffer.isBuffer(kp.publicKey)).toBe(true)
      expect(Buffer.isBuffer(kp.secretKey)).toBe(true)
      expect(kp.publicKey).toHaveLength(BOX_PUBLICKEYBYTES)
      expect(kp.secretKey).toHaveLength(BOX_SECRETKEYBYTES)
    })

    it('createBoxKeyPair() accepts a seed', () => {
      const seed = Buffer.alloc(BOX_SEEDBYTES, 'a')
      const kp1 = createBoxKeyPair(seed)
      const kp2 = createBoxKeyPair(seed)
      expect(kp1.publicKey.equals(kp2.publicKey)).toBe(true)
      expect(kp1.secretKey.equals(kp2.secretKey)).toBe(true)

      const otherSeed = Buffer.alloc(BOX_SEEDBYTES, 'b')
      const kp3 = createBoxKeyPair(otherSeed)
      expect(kp1.publicKey.equals(kp3.publicKey)).toBe(false)
      expect(kp1.secretKey.equals(kp3.secretKey)).toBe(false)
    })

    it('createBoxKeyPair() throws if the provided seed is too short', () => {
      const seed = Buffer.alloc(BOX_SEEDBYTES - 1)
      expect(() => createBoxKeyPair(seed)).toThrow(
        `Invalid seed, must be at least ${BOX_SEEDBYTES} bytes long`,
      )
    })

    it('createBoxPublicFromSign() creates an encryption public key from a signing one', () => {
      const kp = createSignKeyPair()
      const pubKey = createBoxPublicFromSign(kp.publicKey)
      expect(pubKey).toHaveLength(BOX_PUBLICKEYBYTES)
    })

    it('createBoxKeyPairFromSign() creates an encryption KeyPair from a signing one', () => {
      const kp = createBoxKeyPairFromSign(createSignKeyPair())
      expect(kp.publicKey).toHaveLength(BOX_PUBLICKEYBYTES)
      expect(kp.secretKey).toHaveLength(BOX_SECRETKEYBYTES)
    })

    it('provides encryptBox() and decryptBox()', () => {
      const message = Buffer.from('test')
      const fromKP = createBoxKeyPair()
      const toKP = createBoxKeyPair()
      const otherKP = createBoxKeyPair()

      const encrypted = encryptBox(message, toKP.publicKey, fromKP.secretKey)
      const decrypted = decryptBox(encrypted, fromKP.publicKey, toKP.secretKey)
      expect(message.equals(decrypted)).toBe(true)

      const notDecrypted = decryptBox(
        encrypted,
        fromKP.publicKey,
        otherKP.secretKey,
      )
      expect(notDecrypted).toBeUndefined()
    })
  })

  describe('secret box', () => {
    it('createSecretBoxKey() creates a random secret box key', () => {
      const key = createSecretBoxKey()
      expect(key).toHaveLength(SECRETBOX_KEYBYTES)
      const otherKey = createSecretBoxKey()
      expect(key.equals(otherKey)).toBe(false)
    })

    it('createSecretBoxKeyFromPassword() creates a secret box key from a password', async () => {
      const createKey = (pwd, slt) => {
        // Use minimum opslimit and memlimit to make test fast
        return createSecretBoxKeyFromPassword(
          pwd,
          slt,
          PASSWORDHASH_OPSLIMIT_MIN,
          PASSWORDHASH_MEMLIMIT_MIN,
        )
      }

      const password = Buffer.from('not so secure')
      const salt = createPasswordHashSalt()
      const otherSalt = createPasswordHashSalt()

      const [
        ref,
        samePasswordAndKey,
        samePasswordOtherSalt,
        otherPasswordSameSalt,
      ] = await Promise.all([
        createKey(password, salt),
        createKey(password, salt),
        createKey(password, otherSalt),
        createKey(Buffer.from('not so secure either'), salt),
      ])
      expect(ref).toHaveLength(SECRETBOX_KEYBYTES)
      expect(ref.equals(samePasswordAndKey)).toBe(true)
      expect(ref.equals(samePasswordOtherSalt)).toBe(false)
      expect(ref.equals(otherPasswordSameSalt)).toBe(false)
    })

    it('provides encryptSecretBox() and decryptSecretBox()', () => {
      const key = createSecretBoxKey()
      const message = Buffer.from('test message')

      const encrypted = encryptSecretBox(message, key)
      expect(Buffer.isBuffer(encrypted.cipher)).toBe(true)
      expect(Buffer.isBuffer(encrypted.nonce)).toBe(true)
      expect(encrypted.nonce).toHaveLength(SECRETBOX_NONCEBYTES)

      const decrypted = decryptSecretBox(encrypted, key)
      expect(message.equals(decrypted)).toBe(true)

      const notDecrypted = decryptSecretBox(encrypted, createSecretBoxKey())
      expect(notDecrypted).toBeUndefined()
    })
  })

  describe('hash', () => {
    it('hash() the provided input', () => {
      const hashed = hash(Buffer.from('data to hash'), GENERICHASH_BYTES_MIN)
      expect(hashed).toHaveLength(GENERICHASH_BYTES_MIN)
    })

    it('hashStream() returns a promise of the hash after the stream is read until the end', async () => {
      const stream = new StreamToRead('here are the stream contents')
      const hashed = await hashStream(stream)
      expect(hashed).toHaveLength(GENERICHASH_BYTES)
    })
  })

  describe('password', () => {
    it('createPasswordHashSalt() returns a Buffer to use as password salt', () => {
      const salt = createPasswordHashSalt()
      expect(Buffer.isBuffer(salt)).toBe(true)
      expect(salt).toHaveLength(PASSWORDHASH_SALTBYTES)
      expect(salt.equals(createPasswordHashSalt())).toBe(false)
    })

    it('hashPassword() hashed a password into the provided buffer', async () => {
      const hash = Buffer.allocUnsafe(24) // Will be mutated
      const hashClone = Buffer.from(hash)
      expect(hash.equals(hashClone)).toBe(true)

      await hashPassword(
        hash,
        Buffer.from('my password'),
        createPasswordHashSalt(),
      )
      expect(hash.equals(hashClone)).toBe(false)
    })
  })

  describe('random', () => {
    it('randomBytes() returns a buffer with random data', () => {
      const buf = randomBytes(24)
      expect(Buffer.isBuffer(buf)).toBe(true)
      expect(buf).toHaveLength(24)
      expect(buf.equals(randomBytes(24))).toBe(false)
    })

    it('secureRandomBytes() returns a buffer with random data', () => {
      const buf = secureRandomBytes(24)
      expect(Buffer.isBuffer(buf)).toBe(true)
      expect(buf).toHaveLength(24)
      expect(buf.equals(secureRandomBytes(24))).toBe(false)
    })
  })

  describe('sign', () => {
    it('createSignKeyPair() creates a KeyPair for signing', () => {
      const kp = createSignKeyPair()
      expect(Buffer.isBuffer(kp.publicKey)).toBe(true)
      expect(Buffer.isBuffer(kp.secretKey)).toBe(true)
      expect(kp.publicKey).toHaveLength(SIGN_PUBLICKEYBYTES)
      expect(kp.secretKey).toHaveLength(SIGN_SECRETKEYBYTES)
    })

    it('createSignKeyPair() accepts a seed', () => {
      const seed = Buffer.alloc(SIGN_SEEDBYTES, 'a')
      const kp1 = createSignKeyPair(seed)
      const kp2 = createSignKeyPair(seed)
      expect(kp1.publicKey.equals(kp2.publicKey)).toBe(true)
      expect(kp1.secretKey.equals(kp2.secretKey)).toBe(true)

      const otherSeed = Buffer.alloc(SIGN_SEEDBYTES, 'b')
      const kp3 = createSignKeyPair(otherSeed)
      expect(kp1.publicKey.equals(kp3.publicKey)).toBe(false)
      expect(kp1.secretKey.equals(kp3.secretKey)).toBe(false)
    })

    it('createSignKeyPair() throws if the provided seed is too short', () => {
      const seed = Buffer.alloc(SIGN_SEEDBYTES - 1)
      expect(() => createSignKeyPair(seed)).toThrow(
        `Invalid seed, must be at least ${SIGN_SEEDBYTES} bytes long`,
      )
    })

    it('provides getSignature() and verifySignature() for detached signatures', () => {
      const kp = createSignKeyPair()
      const message = Buffer.from('message to sign')

      const signature = getSignature(message, kp.secretKey)
      expect(Buffer.isBuffer(signature)).toBe(true)
      expect(signature).toHaveLength(SIGN_BYTES)

      const valid = verifySignature(message, signature, kp.publicKey)
      expect(valid).toBe(true)

      const otherKP = createSignKeyPair()
      const invalid = verifySignature(message, signature, otherKP.publicKey)
      expect(invalid).toBe(false)
    })

    it('provides sign() and openSigned()', () => {
      const kp = createSignKeyPair()
      const message = Buffer.from('message to sign')

      const signed = sign(message, kp.secretKey)
      expect(Buffer.isBuffer(signed)).toBe(true)

      const verified = openSigned(signed, kp.publicKey)
      expect(message.equals(verified)).toBe(true)

      const otherKP = createSignKeyPair()
      const invalid = openSigned(signed, otherKP.publicKey)
      expect(invalid).toBeUndefined()
    })
  })
})
