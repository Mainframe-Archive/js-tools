import http from '@mainframe/rpc-http-node'
import ipc from '@mainframe/rpc-ipc'
import ws from '@mainframe/rpc-ws-node'

const HTTP_RE = /^https?:\/\//i
const WS_RE = /^wss?:\/\//i

export const httpRPC = http
export const ipcRPC = ipc
export const wsRPC = ws

export default function createRPC(
  endpoint: string,
): ReturnType<typeof http> | ReturnType<typeof ipc> | ReturnType<typeof ws> {
  if (HTTP_RE.test(endpoint)) {
    return http(endpoint)
  }
  if (WS_RE.test(endpoint)) {
    return ws(endpoint)
  }
  return ipc(endpoint)
}
