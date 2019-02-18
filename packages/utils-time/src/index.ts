export function sleep(time: number = 0): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export class TimeoutError extends Error {}

export function createTimeout(time: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Timeout after ${time}ms`))
    }, time)
  })
}

export function withTimeout<T = any>(
  wait: Promise<T>,
  time: number,
): Promise<T> {
  return Promise.race([wait, createTimeout(time)])
}

export function createWithTimeout(defaultTime: number) {
  return function<T = any>(wait: Promise<T>, maybeTime?: number): Promise<T> {
    return withTimeout<T>(wait, maybeTime == null ? defaultTime : maybeTime)
  }
}

export function createGetTime() {
  let time = Date.now()
  return function getTime(): number {
    const now = Date.now()
    time = time >= now ? time + 1 : now
    return time
  }
}
