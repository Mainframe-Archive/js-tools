# utils-time

Time-related utilities.

## Installation

```sh
yarn add @mainframe/utils-time
```

## Usage

```js
import { createWithTimeout, TimeoutError, withTimeout } from 'utils-id'

const max10secs = createWithTimeout(10000)

const run = async () => {
  try {
    const tooLong = await max10secs(fetch(...))
  } catch (err) {
    if (err instanceof TimeoutError) {
      ...
    }
  }

  const longerTime = await withTimeout(fetch(...), 60 * 1000) // 1 min
}
```

## API

### sleep

Waits for the given `time` before resolving.

**Arguments**

1.  `time: number`

**Returns** `Promise<void>`

### new TimeoutError

**Arguments**

1.  `message: string`

### withTimeout

Races between the given `wait` promise and `time` before rejecting with a `TimeoutError`.

**Arguments**

1.  `wait: Promise<T>`
1.  `time: number`

**Returns** `Promise<T>`

### createWithTimeout

Creates a `withTimeout()` function with a given default `time`.

**Arguments**

1.  `time: number`

**Returns** `(wait: Promise<T>, time?: number) => Promise<T>`

### createGetTime

Creates function that will return an always increasing current time value based on `Date.now()`.

**Returns** `() => number`

## License

MIT
