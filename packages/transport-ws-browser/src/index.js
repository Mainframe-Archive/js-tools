// @flow

import { WebSocketSubject } from 'rxjs/webSocket'

export default (url: string) => new WebSocketSubject<Object>({ url })
