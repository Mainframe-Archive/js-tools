# utils-crypto

Cryptographic primitives using [sodium](https://github.com/sodium-friends/sodium-universal).

## Installation

```sh
yarn add @mainframe/utils-crypto
```

## Types

### KeyPair

Object containing the public and secret parts of the key:

```js
type KeyPair = {
  publicKey: Buffer,
  secretKey: Buffer,
}
```

### EncryptedBox

```js
type EncryptedBox = {
  cipher: Buffer,
  nonce: Buffer,
}
```

## API

### createBoxKeyPair()

Creates a `KeyPair` for encryption, using the optionally provided `seed` to generate it.

**Arguments**

1.  `seed?: Buffer`

**Returns** `KeyPair`

### createBoxPublicFromSign()

Converts a public signing key to an encryption one.

**Arguments**

1.  `signKey: Buffer`

**Returns** public encryption key `Buffer`

### createBoxKeyPairFromSign()

Converts a signing `KeyPair` to an encryption one.

**Arguments**

1.  `signPair: KeyPair`

**Returns** encryption `KeyPair`

### encryptBox()

Creates an `EncryptedBox` of the provided `data` using the `fromSecretKey` so it can be decrypted by the owner of the `forPublicKey`.

**Arguments**

1.  `data: Buffer`
1.  `forPublicKey: Buffer`
1.  `fromSecretKey: Buffer`

**Returns** `EncryptedBox`

### decryptBox()

Decrypts the provided `EncryptedBox` using the `fromPublicKey` and `forSecretKey`.

**Arguments**

1.  `encrypted: EncryptedBox`
1.  `fromPublicKey: Buffer`
1.  `forSecretKey: Buffer`

**Returns** `Buffer`

### createSecretBoxKey()

Creates a random secret box encryption key.

**Returns** `Buffer` with length `SECRETBOX_KEYBYTES` (`crypto_secretbox_KEYBYTES`)

### createSecretBoxKeyFromPassword()

Creates a secret box encryption key from the provided `password` and other arguments. See [hashPassword()](#hashPassword) for more details about the arguments values.

**Arguments**

1.  `password: Buffer`
1.  `salt: Buffer`
1.  `opslimit?: number`, defaults to `PASSWORDHASH_OPSLIMIT_SENSITIVE`
1.  `memlimit?: number`, defaults to `PASSWORDHASH_MEMLIMIT_SENSITIVE`
1.  `algorithm?: number`

**Returns** `Promise<Buffer>`

### encryptSecretBox()

Creates an `EncryptedBox` of the provided `data` using the `key`.

**Arguments**

1.  `data: Buffer`
1.  `key: Buffer`

**Returns** `EncryptedBox`

### decryptSecretBox()

Decrypts the provided `EncryptedBox` using the `key`.

**Arguments**

1.  `data: Buffer`
1.  `key: Buffer`

**Returns** `Buffer`

### hash()

Hashes the provided `input` to a buffer of the optional `size`, using the `key` if provided.

**Arguments**

1.  `input: Buffer`
1.  `size?: number`
1.  `key?: Buffer`

**Returns** `Buffer`

### hashStream()

Hashes the provided readable `stream` to a buffer of the optional `size`.

**Arguments**

1.  `stream: Readable`
1.  `size?: number`

**Returns** `Promise<Buffer>`

### createPasswordHashSalt()

Creates a random salt for password hashing.

**Returns** `Buffer` with length `PASSWORDHASH_SALT_BYTES` (`crypto_pwhash_SALTBYTES`)

### hashPassword()

Hashes the provided `password` to the `hash` buffer.

**Arguments**

1.  `hash: Buffer` with length between `PASSWORDHASH_BYTES_MIN` (`crypto_pwhash_BYTES_MIN`) and `PASSWORDHASH_BYTES_MAX` (`crypto_pwhash_BYTES_MAX`)
1.  `password: Buffer`
1.  `salt: Buffer` with length `PASSWORDHASH_SALT_BYTES` (`crypto_pwhash_SALTBYTES`)
1.  `opslimit?: number` between `PASSWORDHASH_OPSLIMIT_MIN` (`crypto_pwhash_OPSLIMIT_MIN`) and `PASSWORDHASH_OPSLIMIT_MAX` (`crypto_pwhash_OPSLIMIT_MAX`), defaults to `PASSWORDHASH_OPSLIMIT_MODERATE` (`crypto_pwhash_OPSLIMIT_MODERATE`)
1.  `memlimit?: number` between `PASSWORDHASH_MEMLIMIT_MIN` (`crypto_pwhash_MEMLIMIT_MIN`) and `PASSWORDHASH_MEMLIMIT_MAX` (`crypto_pwhash_MEMLIMIT_MAX`), defaults to `PASSWORDHASH_MEMLIMIT_MODERATE` (`crypto_pwhash_MEMLIMIT_MODERATE`)
1.  `algorithm?: number`, defaults to `PASSWORDHASH_ALG_ARGON2ID13` (`crypto_pwhash_ALG_ARGON2ID13`)

**Returns** `Promise<Buffer>`

### randomBytes()

Generates a buffer of random data having the provided `size`.

**Arguments**

1.  `size: number`

**Returns** `Buffer`

### secureRandomBytes()

Generates a secure buffer (protected memory) of random data having the provided `size`.

**Arguments**

1.  `size: number`

**Returns** `Buffer`

### createSecretStreamKey()

Creates a random secret stream encryption key.

**Returns** `Buffer` with length `SECRETSTREAM_KEYBYTES` (`crypto_secretstream_xchacha20poly1305_KEYBYTES`)

### createEncryptStream()

Creates a `Transform` stream encrypting contents using the provided `key`.
This transform will add the encryption headers of length `SECRETSTREAM_HEADERBYTES` (`crypto_secretstream_xchacha20poly1305_HEADERBYTES`) to the output stream.

**Arguments**

1.  `key: Buffer` of length `SECRETSTREAM_KEYBYTES`

**Returns** [`Transform` stream](https://nodejs.org/dist/latest-v10.x/docs/api/stream.html#stream_class_stream_transform)

### createDecryptStream()

Creates a `Transform` stream decrypting contents using the provided `key`.
This transform expects the encryption headers to be present in the first `SECRETSTREAM_HEADERBYTES` (`crypto_secretstream_xchacha20poly1305_HEADERBYTES`) bytes of the input stream, as added by the [`createEncryptStream()`](#createEncryptStream) function.

**Arguments**

1.  `key: Buffer` of length `SECRETSTREAM_KEYBYTES`

**Returns** [`Transform` stream](https://nodejs.org/dist/latest-v10.x/docs/api/stream.html#stream_class_stream_transform)

### createSignKeyPair()

Creates a `KeyPair` for signature, using the optionally provided `seed` to generate it.

**Arguments**

1.  `seed?: Buffer`

**Returns** `KeyPair`

### getSignature()

Returns the signature for the provided `data` and `secretKey`.

**Arguments**

1.  `data: Buffer`
1.  `secretKey: Buffer`

**Returns** `Buffer`

### verifySignature()

Verifies the provided `data` has a valid `signature` for the `publicKey`.

**Arguments**

1.  `data: Buffer`
1.  `signature: Buffer`
1.  `publicKey: Buffer`

**Returns** `boolean`

### sign()

Signs the provided `data` with the `secretKey` and returns the signed data.

**Arguments**

1.  `data: Buffer`
1.  `secretKey: Buffer`

**Returns** `Buffer`

### openSigned()

Verifies the provided `data` has been signed for the `publicKey` and returns the unsigned data. If the signature is incorrect, nothing is returned.

**Arguments**

1.  `data: Buffer`
1.  `publicKey: Buffer`

**Returns** `?Buffer`

## License

MIT
