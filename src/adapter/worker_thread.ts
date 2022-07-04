import isNil from 'lodash/isNil'
import { AdaptorEvent, ConnectionHandler, UniversalAdaptor } from './interface'
import { InferTransferable, NodeEndpoint } from '@/protocol'
import { UniversalFn } from '@/stub/stub'

export class WorkerThreadAdaptor<Thread extends NodeEndpoint>
  implements UniversalAdaptor<Thread>
{
  private listeners = new Map<string, WeakMap<UniversalFn, UniversalFn<this>>>()

  constructor(public client: Thread) {}

  on<Data = unknown>(
    event: AdaptorEvent.MESSAGE,
    fn: ConnectionHandler<any, Data>
  ): void {
    this.listeners.set(
      event,
      (this.listeners.get(event) || new WeakMap()).set(fn, fn.bind(this))
    )
    this.client.addListener(
      'message',
      // The above code prove that non-null assertion is safe
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.listeners.get(event)!.get(fn) as UniversalFn<this>
    )
  }

  off<Fn extends UniversalFn>(event: AdaptorEvent.MESSAGE, fn?: Fn) {
    if (isNil(fn)) {
      this.listeners.delete(event)
      this.client.removeAllListeners(event)
      return
    }
    this.listeners.get(event)?.delete(fn)
    this.client.removeListener(event, fn)
  }

  postMessage<Data>(
    data: Data,
    transferable?: InferTransferable<Thread>
  ): void {
    this.client.postMessage(data, transferable)
  }
}
