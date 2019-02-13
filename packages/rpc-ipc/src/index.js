// @flow

import StreamRPC from '@mainframe/rpc-stream'
import ipcTransport, { type PathOrConfig } from '@mainframe/transport-ipc'

export default (pathOrConfig: PathOrConfig) => {
  return new StreamRPC(ipcTransport(pathOrConfig))
}
