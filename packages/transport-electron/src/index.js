// @flow

import { ipcRenderer } from 'electron'
import { Subject, Subscriber, Subscription } from 'rxjs'
import { AnonymousSubject } from 'rxjs/internal/Subject'

export class ElectronTransport extends AnonymousSubject<Object> {
  constructor(channel: ?string = 'rpc-message') {
    super()

    this._output = new Subject()

    this.destination = Subscriber.create(
      msg => {
        ipcRenderer.send(channel, msg)
      },
      err => {
        this._output.error(err)
        this._reset()
      },
    )

    ipcRenderer.on(channel, (event, msg) => {
      try {
        this._output.next(msg)
      } catch (err) {
        this._output.error(err)
      }
    })
  }

  _subscribe(subscriber: Subscriber<Object>) {
    const subscription = new Subscription()
    subscription.add(this._output.subscribe(subscriber))
    return subscription
  }
}

export default (channel?: ?string) => new ElectronTransport(channel)
