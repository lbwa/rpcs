import isNil from 'lodash/isNil'
import { AdaptorEvent, ConnectionHandler, UniversalAdaptor } from './interface'
import { UniversalFn } from '@/stub/stub'
import { BrowserEndpoint, InferTransferable } from '@/protocol'

export class BrowserAdaptor<WebWorker extends BrowserEndpoint>
  implements UniversalAdaptor<WebWorker>
{
  private listeners = new Map<string, Map<UniversalFn, UniversalFn<this>>>()

  constructor(public client: WebWorker) {}

  on<Data = unknown>(
    event: AdaptorEvent.MESSAGE,
    fn: ConnectionHandler<any, Data>
  ): void {
    this.listeners.set(
      event,
      (
        this.listeners.get(event) || new Map<UniversalFn, UniversalFn<this>>()
      ).set(fn, fn.bind(this))
    )
    this.client.addEventListener(
      'message',
      // The above code prove that non-null assertion is safe
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.listeners.get(event)!.get(fn) as UniversalFn<this>
    )
  }

  off(event: AdaptorEvent.MESSAGE, fn?: UniversalFn) {
    if (isNil(fn)) {
      for (const fn of this.listeners.get(event)?.values() ?? []) {
        this.client.removeEventListener(event, fn)
      }
      this.listeners.delete(event)
      return
    }
    this.listeners.get(event)?.delete(fn)
    this.client.removeEventListener(event, fn)
  }

  postMessage<Data>(data: Data, transfer?: InferTransferable<WebWorker>): void {
    this.client.postMessage(data, { transfer })
  }
}
