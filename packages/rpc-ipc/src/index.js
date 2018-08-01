// @flow

import StreamRPC from '@mainframe/rpc-stream'
import ipcTransport, { type SocketConfig } from '@mainframe/transport-ipc'

export default <T>(pathOrConfig: string | SocketConfig<T>) => {
  return new StreamRPC(ipcTransport(pathOrConfig))
}
