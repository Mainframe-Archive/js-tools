import StreamRPC from '@mainframe/rpc-stream'
import wsTransport from '@mainframe/transport-ws-node'

export default function createRPC<T = any>(url: string): StreamRPC {
  return new StreamRPC(wsTransport<T>(url))
}
