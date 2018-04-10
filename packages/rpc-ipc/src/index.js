// @flow

import StreamRPC from '@mainframe/rpc-stream'
import ipcTransport from '@mainframe/transport-ipc'

export default (path: string) => new StreamRPC(ipcTransport(path))
