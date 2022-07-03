import { Worker } from 'worker_threads'
import isNil from 'lodash/isNil'
import { AdaptorEvent, ConnectionHandler, UniversalAdaptor } from './interface'
import { UniversalFn } from '@/stub/stub'
import {
  InferTransferable,
  isRpcExceptionResponse,
  RpcResponse
} from '@/protocol'
import { createUid } from '@/utils'

export class WorkerThreadAdaptor implements UniversalAdaptor<Worker> {
  private listeners = new Map<string, WeakMap<UniversalFn, UniversalFn<this>>>()

  constructor(public client: Worker) {}

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
    transferable?: InferTransferable<Worker>
  ): void {
    this.client.postMessage(data, transferable)
  }

  async request<Data, Response>(
    payload: Data,
    transferable?: InferTransferable<Worker>
  ): Promise<Response> {
    const uid = createUid()

    return new Promise<Response>((resolve, reject) => {
      const onmessage = (response: RpcResponse<Response>) => {
        if (response?.id !== uid) {
          return
        }
        this.off(AdaptorEvent.MESSAGE, onmessage)
        if (isRpcExceptionResponse(response)) {
          return reject(response.error)
        }
        resolve(response.result)
      }
      this.on(AdaptorEvent.MESSAGE, onmessage)
      this.postMessage(Object.assign({ id: uid }, payload), transferable)
    })
  }
}
