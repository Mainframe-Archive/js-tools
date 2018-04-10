// @flow

import StreamRPC from '@mainframe/rpc-stream'
import wsTransport from '@mainframe/transport-ws-node'

export default (url: string) => new StreamRPC(wsTransport(url))
