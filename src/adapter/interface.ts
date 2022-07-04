import { InferTransferable, RpcMessage, RpcResponse } from '@/protocol'
import { UniversalFn } from '@/stub/stub'

export enum AdaptorEvent {
  MESSAGE = 'message'
}

export interface ConnectionRequestHandler<Callee> {
  (this: Callee, payload: RpcMessage): void
}

export interface ConnectionResponseHandler<Callee, Data> {
  (this: Callee, payload: RpcResponse<Data>): void
}

export type ConnectionHandler<Callee, ResponseData> =
  | ConnectionRequestHandler<Callee>
  | ConnectionResponseHandler<Callee, ResponseData>

/**
 * As a client/server adaptor for redirecting API calling. We should not
 * include any exclusive logics in adaptor layer;
 */
export interface UniversalAdaptor<Client> {
  client: Client
  on<Fn extends ConnectionHandler<this, Response>, Response = unknown>(
    event: AdaptorEvent,
    fn: Fn
  ): void
  off?<Fn extends UniversalFn>(event: AdaptorEvent, fn?: Fn): void
  postMessage<Data>(data: Data, transferable?: InferTransferable<Client>): void
}
