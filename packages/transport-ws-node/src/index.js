// @flow

import { WebSocketSubject } from 'rxjs/webSocket'
import WebSocket from 'ws'

export default (url: string) => {
  return new WebSocketSubject<Object>({ url, WebSocketCtor: WebSocket })
}
