import http from '@mainframe/rpc-http-browser'
import ws from '@mainframe/rpc-ws-browser'

const HTTP_RE = /^https?:\/\//i
const WS_RE = /^wss?:\/\//i

export const httpRPC = http
export const wsRPC = ws

export default function createRPC(
  endpoint: string,
): ReturnType<typeof http> | ReturnType<typeof ws> {
  if (HTTP_RE.test(endpoint)) {
    return http(endpoint)
  }
  if (WS_RE.test(endpoint)) {
    return ws(endpoint)
  }
  throw new Error('Invalid endpoint provided: expecting HTTP or WebSocket URL')
}
