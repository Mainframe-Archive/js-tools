# secure-file

Cryptographic utilities for files.

## Installation

```sh
yarn add @mainframe/secure-file
```

## Usage

```js
import {
  createFileHash,
  writeEncryptedFile,
  readEncryptedFile,
  writeSignedFile,
  readSignedFile,
} from '@mainframe/secure-file'
import { decodeBase64, encodeBase64 } from '@mainframe/utils-base64'
import {
  PASSWORDHASH_ALG_ARGON2ID13,
  PASSWORDHASH_MEMLIMIT_SENSITIVE,
  PASSWORDHASH_OPSLIMIT_SENSITIVE,
  createPasswordHashSalt,
  createSecretBoxKey,
  createSecretBoxKeyFromPassword,
  createSignKeyPair,
} from '@mainframe/utils-crypto'

// Get a file hash
const hash = await createFileHash('/path/to/file')

// Encrypt and decrypt a file using a provided key
const encryptData = Buffer.from('secret')
const encryptKey = createSecretBoxKey()
await writeEncryptedFile('/path/to/file', encryptData, encryptKey)
const fileData = readEncryptedFile('/path/to/file', encryptKey)
encryptData.equals(fileData.opened) // true

// Encrypt and decrypt a file using a key derived from password
const password = Buffer.from('password')
// Function computing the secret key based on the know password and hashing config
const getKey = (metadata) => {
  return createSecretBoxKeyFromPassword(
    password,
    decodeBase64(metadata.salt),
    metadata.opslimit,
    metadata.memlimit,
    metadata.algorithm,
  )
}
const encryptData = Buffer.from('secret')
const metadata = {
  algorithm: PASSWORDHASH_ALG_ARGON2ID13,
  memlimit: PASSWORDHASH_MEMLIMIT_SENSITIVE,
  opslimit: PASSWORDHASH_OPSLIMIT_SENSITIVE,
  salt: encodeBase64(createPasswordHashSalt()),
}
await writeEncryptedFile(
  '/path/to/file',
  encryptData,
  await getKey(metadata),
  metadata, // Stored in clear in the file alongside encrypted contents
)
// getKey() will be used to retrieve the decryption key based on the stored metadata
const fileData = readEncryptedFile('/path/to/file', getKey)
encryptData.equals(fileData.opened) // true

// Sign using a single key
const signData = Buffer.from('important')
const signKey = createSignKeyPair()
await writeSignedFile('/path/to/file', signData)
const signedFile = await readSignedFile('/path/to/file')
// Public keys are stored in the file to verify the signed contents
signedFile.file.contents.signed.keys[0] === signKey.publicKey // true
signData.equals(signedFile.opened) // true

// Sign using multiple keys
const signData = Buffer.from('important')
const aliceKey = createSignKeyPair()
const bobKey = createSignKeyPair()
await writeSignedFile('/path/to/file', signData, [aliceKey, bobKey])
const signedFile = await readSignedFile('/path/to/file')
signData.equals(signedFile.opened) // true
```

## Types

### EncodedBox

`base64` encoded version of the `EncryptedBox` from `utils-crypt`:

```js
type EncodedBox = {
  cipher: base64,
  nonce: base64,
}
```

### EncryptedContents

```js
type EncryptedContents = {
  version: 1,
  type: 'encrypted',
  encrypted: EncodedBox,
}
```

### SignedContents

```js
type SignedContents = {
  version: 1,
  type: 'signed',
  signed: {
    keys: Array<base64>,
    message: base64,
  },
}
```

### SecureContents

```js
type SecureContents = EncryptedContents | SignedContents
```

### SecureFile

Shape of the JSON data stored when writing a secure file to disk.

```js
type SecureFile<T = SecureContents> = {
  version: 1,
  contents: T,
  metadata?: Object,
}
```

### OpenedSecureFile

Shape of the JSON data returned after reading a secure file from disk. `opened` is only provided if the file has successfully been decrypted or having verified signatures.

```js
type OpenedSecureFile<T> = {
  file: SecureFile<T>,
  opened: ?Buffer,
}
```

### KeyExtractor

```js
type KeyExtractor = (metadata?: Object) => Promise<Buffer>
```

## API

### createFileHash()

Calculates the hash of the provided file using `hashStream()` from `utils-crypto`.

**Arguments**

1.  `path: string`
1.  `size?: number`

**Returns** `Promise<Buffer>`

### writeEncryptedFile()

**Arguments**

1.  `path: string`
1.  `data: Buffer`: data to encrypt
1.  `key: Buffer`: secret key
1.  `metadata?: Object`: optional additional metadata stored in clear

**Returns** `Promise<void>`

### readEncryptedFile()

**Arguments**

1.  `path: string`
1.  `key: Buffer | KeyExtractor`: secret key or function returning a promise of the key using the stored `metadata`

**Returns** `Promise<OpenedSecureFile<EncryptedContents>>`

### writeSignedFile()

**Arguments**

1.  `path: string`
1.  `data: Buffer`: data to sign
1.  `key: KeyPair | Array<KeyPair>`: single or list of keys used to sign the data. The public keys will be stored along with the signed message. The order of the keys matter as the message will be signed with each key using the provided sequence.
1.  `metadata?: Object`: optional additional metadata stored in clear

**Returns** `Promise<void>`

### readSignedFile()

**Arguments**

1.  `path: string`
1.  `keys?: Array<Buffer>`: list of public keys to use to verify the signatures. The order of the keys must be the same as when calling `writeSignedFile()` (verification happens in reverse order of iteration). When not provided, the keys stored in the file will be used.

**Returns** `Promise<OpenedSecureFile<SignedContents>>`

## License

MIT
