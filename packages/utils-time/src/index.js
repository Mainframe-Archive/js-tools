// @flow

import BaseError from 'es6-error'

export const sleep = (time: number = 0): Promise<void> => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export class TimeoutError extends BaseError {}

export const createTimeout = (time: number): Promise<empty> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Timeout after ${time}ms`))
    }, time)
  })
}

export const withTimeout = <T>(wait: Promise<T>, time: number): Promise<T> => {
  return Promise.race([wait, createTimeout(time)])
}

export const createWithTimeout = (defaultTime: number) => {
  return <T>(wait: Promise<T>, maybeTime?: number): Promise<T> => {
    return withTimeout<T>(wait, maybeTime == null ? defaultTime : maybeTime)
  }
}

export const createGetTime = () => {
  let time = Date.now()
  return () => {
    const now = Date.now()
    time = time >= now ? time + 1 : now
    return time
  }
}
