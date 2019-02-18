import RequestRPC from '@mainframe/rpc-request'
import httpTransport from '@mainframe/transport-http-node'

export default function createRPC(url: string) {
  return new RequestRPC(httpTransport(url))
}
