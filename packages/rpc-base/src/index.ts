import nanoid from 'nanoid'

export type RPCID = string | number | null

export interface RPCRequest<T = any> {
  jsonrpc: '2.0'
  method: string
  id?: RPCID
  params?: T | undefined
}

export interface RPCErrorObject<T = any> {
  code: number
  message?: string | undefined
  data?: T
}

export interface RPCResponse<T = any, E = any> {
  jsonrpc: '2.0'
  id?: RPCID
  result?: T
  error?: RPCErrorObject<E>
}

export default abstract class BaseRPC {
  private _canSubscribe: boolean

  public constructor(canSubscribe: boolean = false) {
    this._canSubscribe = canSubscribe
  }

  public get canSubscribe(): boolean {
    return this._canSubscribe === true
  }

  public createId(): string {
    return nanoid()
  }

  abstract request<P = any, R = any>(method: string, params?: P): Promise<R>
}
