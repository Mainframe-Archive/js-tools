// @flow

import http from '@mainframe/rpc-http-browser'
import web3 from '@mainframe/rpc-web3'
import ws from '@mainframe/rpc-ws-browser'

const HTTP_RE = /^https?:\/\//gi
const WS_RE = /^wss?:\/\//gi

export const httpRPC = http
export const web3RPC = web3
export const wsRPC = ws

export default (endpoint?: ?(string | Object)) => {
  if (typeof endpoint === 'string') {
    if (HTTP_RE.test(endpoint)) {
      return http(endpoint)
    }
    if (WS_RE.test(endpoint)) {
      return ws(endpoint)
    }
  }
  return web3(endpoint)
}
