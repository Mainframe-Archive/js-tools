// @flow

// eslint-disable-next-line import/named
import { uniqueID, type ID } from '@mainframe/utils-id'

export type RPCID = string | number | null

export type RPCRequest = {
  jsonrpc: '2.0',
  method: string,
  id?: RPCID,
  params?: any,
}

export type RPCErrorObject = {
  code: number,
  message?: ?string,
  data?: any,
}

export type RPCResponse = {
  jsonrpc: '2.0',
  id: RPCID,
  result?: any,
  error?: RPCErrorObject,
}

export default class BaseRPC {
  _canSubscribe: boolean

  constructor(canSubscribe?: boolean = false) {
    this._canSubscribe = canSubscribe
  }

  get canSubscribe(): boolean {
    return this._canSubscribe
  }

  createId(): ID {
    return uniqueID()
  }

  // eslint-disable-next-line no-unused-vars
  request(method: string, params?: any): Promise<any> {
    return Promise.reject(new Error('Must be implemented'))
  }
}
