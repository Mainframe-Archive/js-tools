// @flow

// $FlowFixMe: missing definition
import { WebSocketSubject } from 'rxjs/webSocket'
import WebSocket from 'ws'

// Injected globally as RxJS defaults to it
// Should be removed once RxJS removes this requirement
global.WebSocket = WebSocket

export default (url: string) => {
  return new WebSocketSubject({ url, WebSocketCtor: WebSocket })
}
