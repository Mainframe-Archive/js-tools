// @flow

import StreamRPC from '@mainframe/rpc-stream'
import electronTransport from '@mainframe/transport-electron'

export default (channel?: ?string) => {
  return new StreamRPC(electronTransport(channel))
}
