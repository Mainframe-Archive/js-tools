## utils-crypto

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
1.  `forPublicKey: Buffer`
1.  `fromSecretKey: Buffer`

**Returns** `Buffer`

### createSecretBoxKey()

Creates a random key to be used to encrypt data in a secret box.

**Returns** `Buffer`

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
