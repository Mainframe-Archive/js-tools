// @flow

import { Observable, type Subject, Subscriber, type Subscription } from 'rxjs'

import BaseRPC from '@mainframe/rpc-base'
import RPCError from '@mainframe/rpc-error'

export default class StreamRPC extends BaseRPC {
  _observers: Map<string, Subscriber<*>>
  _subscribers: Set<Subscriber<*>>
  _subscription: ?Subscription
  _transport: Subject<Object>

  constructor(transport: Subject<Object>) {
    super(true)
    this._observers = new Map()
    this._subscribers = new Set()
    this._transport = transport
    this.connect()
  }

  get connected(): boolean {
    // $FlowFixMe: missing Subscription.closed property definition
    return this._subscription != null && !this._subscription.closed
  }

  connect() {
    if (this.connected) {
      return
    }

    let failed
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
              const err = RPCError.fromObject(msg.error)
              observer.error(err)
              this._observers.delete(msg.id)
            } else {
              observer.next(msg.result)
            }
          } else {
            // eslint-disable-next-line no-console
            console.warn('Missing observer for message ID:', msg.id)
          }
        }
      },
      error: event => {
        let err
        if (event instanceof Error) {
          err = event
        } else {
          err = new Error('Connection failed')
        }
        failed = err

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

    if (failed != null) {
      throw failed
    }
  }

  disconnect() {
    this._transport.complete()
  }

  observe(method: string, params?: any): Observable<any> {
    return Observable.create(observer => {
      const id = this.createId()
      const msg = { jsonrpc: '2.0', method, id, params }
      this._observers.set(id, new Subscriber(observer))
      this._transport.next(msg)
      return () => {
        this._observers.delete(id)
      }
    })
  }

  request(method: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this.connected) {
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
      } else {
        reject(new Error('Not connected'))
      }
    })
  }

  notify(method: string, params?: any) {
    this._transport.next({ jsonrpc: '2.0', method, params })
  }

  subscribe(...args: Array<*>) {
    if (!this.connected) {
      throw new Error('Not connected')
    }

    const subscriber = new Subscriber(...args)
    this._subscribers.add(subscriber)
    return () => {
      this._subscribers.delete(subscriber)
    }
  }
}
