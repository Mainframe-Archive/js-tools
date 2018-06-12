# utils-hex

Utilities for hexadecimal-encoded strings.

## Installation

```sh
yarn add @mainframe/utils-hex
```

## Usage

```js
import { encodeHex, decodeHex } from 'utils-hex'

const encoded = encodeHex('hello')
const decoded = decodeHex(encoded) // 'hello'
```

## Types

### hex

Opaque type representing an hexadecimal-encoded string prefixed with `0x`

## API

### hexType()

Simple identity function casting the provided value as `hex` to properly type-check.

**Arguments**

1.  `value: any`

**Returns** `hex`

### hexEmpty

**Returns** `0x` value with `hex` type.

### encodeHex()

**Arguments**

1.  `input: string`
1.  `from?: buffer$Encoding = 'utf8'`

**Returns** `hex`

### decodeHex()

**Arguments**

1.  `input: hex`
1.  `to?: buffer$Encoding = 'utf8'`

**Returns** `string`

## License

MIT
