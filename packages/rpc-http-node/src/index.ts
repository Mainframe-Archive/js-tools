import RequestRPC from '@mainframe/rpc-request'
import httpTransport from '@mainframe/transport-http-node'

export default function createRPC(url: string): RequestRPC {
  return new RequestRPC(httpTransport(url))
}
