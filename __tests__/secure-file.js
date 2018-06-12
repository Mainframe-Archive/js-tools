import { tmpdir } from 'os'
import { join, resolve } from 'path'

import {
  createFileHash,
  decodeBox,
  decryptContents,
  encodeBox,
  encryptContents,
  readEncryptedFile,
  readSecureFile,
  readSignedFile,
  signContents,
  verifyContents,
  writeEncryptedFile,
  writeSecureFile,
  writeSignedFile,
} from '../packages/secure-file'
import { decodeBase64, encodeBase64 } from '../packages/utils-base64'
import {
  PASSWORDHASH_ALG_ARGON2ID13,
  PASSWORDHASH_MEMLIMIT_MIN,
  PASSWORDHASH_OPSLIMIT_MIN,
  createPasswordHashSalt,
  createSecretBoxKey,
  createSecretBoxKeyFromPassword,
  createSignKeyPair,
} from '../packages/utils-crypto'

const getFixture = name => {
  return resolve(__dirname, '__fixtures__/secure-file', name)
}
const getTempFile = name => join(tmpdir(), 'mf-secure-file-test', name)

describe('secure-file', () => {
  describe('encrypt', () => {
    it('provides encodeBox() and decodeBox() to serialize EncryptedBox', () => {
      const encrypted = {
        cipher: Buffer.allocUnsafe(32),
        nonce: Buffer.allocUnsafe(32),
      }
      const encoded = encodeBox(encrypted)
      const decoded = decodeBox(encoded)
      expect(encrypted.cipher.equals(decoded.cipher)).toBe(true)
      expect(encrypted.nonce.equals(decoded.nonce)).toBe(true)
    })

    it('provides encryptContents() and decryptContents()', () => {
      const contents = Buffer.from('contents')
      const key = createSecretBoxKey()

      const encrypted = encryptContents(contents, key)
      expect(encrypted.version).toBe(1)
      expect(encrypted.type).toBe('encrypted')
      expect(encrypted.encrypted).toBeDefined()

      const decrypted = decryptContents(encrypted, key)
      expect(contents.equals(decrypted)).toBe(true)
    })

    it('decryptContents() throws if the version or type is invalid', () => {
      expect(() => decryptContents({ version: 0 })).toThrow('Invalid input')
      expect(() => decryptContents({ version: 1, type: 'something' })).toThrow(
        'Invalid input',
      )
    })

    it('provides writeEncryptedFile() and readEncryptedFile()', async () => {
      const file = getTempFile('encrypt.json')
      const contents = Buffer.from('contents')
      const key = createSecretBoxKey()

      const encrypted = await writeEncryptedFile(file, contents, key)
      const decrypted = await readEncryptedFile(file, key)
      expect(contents.equals(decrypted.opened)).toBe(true)
    })

    it('uses metadata and a key extractor to decrypt the contents', async () => {
      const file = getTempFile('encrypt-meta.json')
      const contents = Buffer.from('contents')
      const password = Buffer.from('not so secure')

      const getKey = meta => {
        return createSecretBoxKeyFromPassword(
          password,
          decodeBase64(meta.salt),
          meta.opslimit,
          meta.memlimit,
          meta.algorithm,
        )
      }
      const metadata = {
        algorithm: PASSWORDHASH_ALG_ARGON2ID13,
        memlimit: PASSWORDHASH_MEMLIMIT_MIN,
        opslimit: PASSWORDHASH_OPSLIMIT_MIN,
        salt: encodeBase64(createPasswordHashSalt()),
      }

      const encrypted = await writeEncryptedFile(
        file,
        contents,
        await getKey(metadata),
        metadata,
      )
      const decrypted = await readEncryptedFile(file, getKey)
      expect(contents.equals(decrypted.opened)).toBe(true)
    })

    it('does not provide the opened buffer if decryption fails', async () => {
      const file = getTempFile('encrypt-fail.json')
      const encrypted = await writeEncryptedFile(
        file,
        Buffer.from('contents'),
        createSecretBoxKey(),
      )
      const notDecrypted = await readEncryptedFile(file, createSecretBoxKey())
      expect(notDecrypted.opened).toBeUndefined()
    })
  })

  describe('fs', () => {
    it('provides readSecureFile() and writeSecureFile()', async () => {
      const file = getTempFile('fs.json')
      await writeSecureFile(file, { test: 'contents' }, { test: 'meta' })
      const data = await readSecureFile(file)
      expect(data).toEqual({
        version: 1,
        contents: { test: 'contents' },
        metadata: { test: 'meta' },
      })
    })

    it('readSecureFile() throws if the file data is invalid', () => {
      const file1 = getFixture('1.not-object.json')
      expect(readSecureFile(file1)).rejects.toThrow('Invalid file')
      const file2 = getFixture('2.no-version.json')
      expect(readSecureFile(file2)).rejects.toThrow('Invalid file')
      const file3 = getFixture('3.bad-version.json')
      expect(readSecureFile(file3)).rejects.toThrow('Invalid file')
      const file4 = getFixture('4.no-contents.json')
      expect(readSecureFile(file1)).rejects.toThrow('Invalid file')
    })
  })

  describe('hash', () => {
    it('createFileHash() returns the hash of the file', async () => {
      const file = getFixture('5.file-hash.txt')
      const hash = await createFileHash(file)
      expect(hash).toMatchSnapshot()
    })
  })

  describe('sign', () => {
    it('provides signContents() and verifyContents()', () => {
      const contents = Buffer.from('contents')
      const kp = createSignKeyPair()

      const signed = signContents(contents, kp)
      expect(signed.version).toBe(1)
      expect(signed.type).toBe('signed')
      expect(signed.signed.keys[0]).toBe(encodeBase64(kp.publicKey))
      expect(signed.signed.message).toBeDefined()

      const verified = verifyContents(signed)
      expect(contents.equals(verified)).toBe(true)
    })

    it('signContents() and verifyContents() handle multiple keys', () => {
      const contents = Buffer.from('contents')
      const keyPairs = [
        createSignKeyPair(),
        createSignKeyPair(),
        createSignKeyPair(),
      ]

      const signed = signContents(contents, keyPairs)
      expect(signed.signed.keys).toHaveLength(3)

      const verified = verifyContents(signed)
      expect(contents.equals(verified)).toBe(true)

      const useKeys = keyPairs.map(kp => kp.publicKey)
      const alsoVerified = verifyContents(signed, useKeys)
      expect(contents.equals(alsoVerified)).toBe(true)

      const failsVerified = verifyContents(signed, useKeys.slice(0, 2))
      expect(failsVerified).toBeUndefined()
    })

    it('signContents() throws an error if an empty array of KeyPairs is provided', () => {
      expect(() => signContents(Buffer.from('test'), [])).toThrow(
        'Missing signing keys',
      )
    })

    it('verifyContents() throws an error if the input is invalid', () => {
      expect(() => verifyContents({})).toThrow('Invalid input')
      expect(() => verifyContents({ version: 0 })).toThrow('Invalid input')
      expect(() => verifyContents({ version: 1, type: 'other' })).toThrow(
        'Invalid input',
      )
    })

    it('provides writeSignedFile() and readSignedFile()', async () => {
      const file = getTempFile('sign.json')
      const contents = Buffer.from('contents')
      const kp = createSignKeyPair()
      const metadata = { test: 'data' }

      await writeSignedFile(file, contents, kp, metadata)
      const data = await readSignedFile(file)

      expect(data.file.version).toBe(1)
      expect(data.file.contents.type).toBe('signed')
      expect(data.file.metadata).toEqual(metadata)
      expect(contents.equals(data.opened)).toBe(true)
    })
  })
})
