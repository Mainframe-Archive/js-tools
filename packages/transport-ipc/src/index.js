// @flow

import { SocketSubject, type Config } from 'rx-socket'

export type SocketConfig<T> = Config<T>

export default <T>(pathOrConfig: string | SocketConfig<T>) => {
  return new SocketSubject(pathOrConfig)
}
