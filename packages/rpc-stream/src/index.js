// @flow

import { Observable, type Subject, Subscriber, type Subscription } from 'rxjs'

import BaseRPC from '@mainframe/rpc-base'

export default class StreamRPC extends BaseRPC {
  _observers: Map<string, Subscriber<*>>
  _subscribers: Set<Subscriber<*>>
  _subscription: Subscription
  _transport: Subject<Object>

  constructor(transport: Subject<Object>) {
    super(true)
    this._observers = new Map()
    this._subscribers = new Set()
    this._transport = transport
    this.connect()
  }

  connect() {
    this._subscription = this._transport.subscribe({
      next: (msg: Object) => {
        if (msg.id == null) {
          this._subscribers.forEach(o => {
            o.next(msg)
          })
        } else {
          const observer = this._observers.get(msg.id)
          if (observer) {
            if (msg.error) {
              const err: Object = new Error(msg.error.message)
              err.code = msg.error.code
              observer.error(err)
              this._observers.delete(msg.id)
            } else {
              observer.next(msg.result)
            }
          } else {
            console.warn('Missing observer for message ID:', msg.id)
          }
        }
      },
      error: err => {
        this._observers.forEach(o => {
          o.error(err)
        })
        this._observers.clear()
        this._subscribers.forEach(o => {
          o.error(err)
        })
        this._subscribers.clear()
      },
      complete: () => {
        this._observers.forEach(o => {
          o.complete()
        })
        this._observers.clear()
        this._subscribers.forEach(o => {
          o.complete()
        })
        this._subscribers.clear()
      },
    })
  }

  observe(method: string, params?: any): Observable<any> {
    return Observable.create(observer => {
      const id = this.createId()
      const msg = { jsonrpc: '2.0', method, id, params }
      this._observers.set(id, new Subscriber(observer))
      this._transport.next(
        // $FlowFixMe
        JSON.stringify(msg),
      )
      return () => {
        this._observers.delete(id)
      }
    })
  }

  request(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const sub = this.observe(method, params).subscribe(
        value => {
          sub.unsubscribe()
          resolve(value)
        },
        err => {
          sub.unsubscribe()
          reject(err)
        },
        () => {
          sub.unsubscribe()
        },
      )
    })
  }

  subscribe(...args: Array<*>) {
    const subscriber = new Subscriber(...args)
    this._subscribers.add(subscriber)
    return () => {
      this._subscribers.delete(subscriber)
    }
  }
}
