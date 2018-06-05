// @flow

// eslint-disable-next-line import/named
import { uniqueID, type ID } from '@mainframe/utils-id'

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

  request(...args: *): Promise<any> {
    return Promise.reject(new Error('Must be implemented'))
  }
}
