// @flow

import { SocketSubject, type ConnectOrConfig } from 'rx-socket'

export type { ConnectOrConfig } from 'rx-socket'

export default (connectOrConfig: ConnectOrConfig) => {
  return new SocketSubject(connectOrConfig)
}
