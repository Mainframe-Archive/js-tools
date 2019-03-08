import StreamRPC from '@mainframe/rpc-stream'
import ipcTransport, { PathOrConfig } from '@mainframe/transport-ipc'

export default function createRPC<T>(pathOrConfig: PathOrConfig): StreamRPC {
  return new StreamRPC(ipcTransport<T>(pathOrConfig))
}
