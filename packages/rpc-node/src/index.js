// @flow

import http from '@mainframe/rpc-http-node'
import ipc from '@mainframe/rpc-ipc'
import ws from '@mainframe/rpc-ws-node'

const HTTP_RE = /^https?:\/\//gi
const WS_RE = /^wss?:\/\//gi

export default (endpoint: string) => {
  if (HTTP_RE.test(endpoint)) {
    return http(endpoint)
  }
  if (WS_RE.test(endpoint)) {
    return ws(endpoint)
  }
  return ipc(endpoint)
}
