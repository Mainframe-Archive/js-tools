# utils-id

Unique identifier utilities.

## Installation

```sh
yarn add @mainframe/utils-id
```

## Usage

```js
import { uniqueID } from 'utils-id'

const id = uniqueID() // random string
```

## Types

### ID

Opaque type representing an unique ID as a `string`.

## API

### idType()

Simple identity function casting the provided value as `ID` to properly type-check.

**Arguments**

1.  `value: any`

**Returns** `ID`

### uniqueID()

**Returns** `ID`

## License

MIT
