# utils-base64

Utilities for base64-encoded strings.

## Installation

```sh
yarn add @mainframe/utils-base64
```

## Usage

```js
import { encodeBase64, decodeBase64 } from 'utils-base64'

const buffer = Buffer.from('test')
const encoded = encodeBase64(buffer) // base64 (string)
const decoded = decodeBase64(encoded) // Buffer
```

## Types

### base64

Opaque type representing a base64-encoded string.

## API

### base64Type()

Simple identity function casting the provided value as `base64` to properly type-check.

**Arguments**

1.  `value: any`

**Returns** `base64`

### encodeBase64()

**Arguments**

1.  `input: Buffer`

**Returns** `base64`

### decodeBase64()

**Arguments**

1.  `input: base64`

**Returns** `Buffer`

## License

MIT
