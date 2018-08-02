// @flow

import StreamRPC from '@mainframe/rpc-stream'
import ipcTransport, { type ConnectOrConfig } from '@mainframe/transport-ipc'

export default (connectOrConfig: ConnectOrConfig) => {
  return new StreamRPC(ipcTransport(connectOrConfig))
}
