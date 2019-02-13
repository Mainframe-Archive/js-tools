// @flow

import { SocketSubject } from 'rx-socket'

export type Config = net$connectOptions & {
  closeObserver?: ?rxjs$NextObserver<boolean>,
  openObserver?: ?rxjs$NextObserver<void>,
  path: string,
}

export type PathOrConfig = string | Config

export default (pathOrConfig: PathOrConfig) => {
  return new SocketSubject<Object>(pathOrConfig)
}
