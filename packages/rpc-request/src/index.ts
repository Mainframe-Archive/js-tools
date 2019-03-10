import BaseRPC from '@mainframe/rpc-base'
import RPCError from '@mainframe/rpc-error'

export type FetchFunction = <D = any, R = any>(data: D) => Promise<R>

export default class RequestRPC extends BaseRPC {
  private _fetch: FetchFunction

  public constructor(fetch: FetchFunction) {
    super(false)
    this._fetch = fetch
  }

  public request<P = any, R = any, E = any>(
    method: string,
    params?: P,
  ): Promise<R> {
    return this._fetch({
      id: this.createId(),
      jsonrpc: '2.0',
      method,
      params,
    }).then(msg => {
      if (msg.error) {
        throw RPCError.fromObject<E>(msg.error)
      }
      return msg.result
    })
  }
}
