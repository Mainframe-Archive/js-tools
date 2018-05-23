// @flow

// $FlowFixMe: missing definition
import { WebSocketSubject } from 'rxjs/webSocket'
import WebSocket from 'ws'

export default (url: string) => {
  return new WebSocketSubject({ url, WebSocketCtor: WebSocket })
}
