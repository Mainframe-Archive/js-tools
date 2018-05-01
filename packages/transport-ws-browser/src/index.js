// @flow

// $FlowFixMe: missing definition
import { WebSocketSubject } from 'rxjs/webSocket'

export default (url: string) => new WebSocketSubject({ url })
