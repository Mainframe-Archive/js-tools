// @flow

import BaseRPC from '@mainframe/rpc-base'
import RPCError from '@mainframe/rpc-error'

export default class RequestRPC extends BaseRPC {
  _fetch: (data: Object) => Promise<Object>

  constructor(fetch: *) {
    super(false)
    this._fetch = fetch
  }

  request(method: string, params?: any): Promise<any> {
    return this._fetch({
      id: this.createId(),
      jsonrpc: '2.0',
      method,
      params,
    }).then(msg => {
      if (msg.error) {
        throw RPCError.fromObject(msg.error)
      }
      return msg.result
    })
  }
}
