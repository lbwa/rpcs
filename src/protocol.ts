import type {
  Worker as WorkerThread,
  MessagePort as WorkerMessagePort,
  TransferListItem
} from 'worker_threads'
import type { PropertyName } from 'lodash'
import isNil from 'lodash/isNil'

export type NodeEndpoint = WorkerThread | WorkerMessagePort

export type BrowserEndpoint = Worker | MessagePort

export type RpcEndpoint = NodeEndpoint | BrowserEndpoint

export type MessageId = string

export type PropertyPath = ReadonlyArray<Exclude<PropertyName, symbol>>

export enum RpcMessageType {
  GET,
  APPLY
}

export interface RpcGetMessage {
  id?: MessageId
  type: RpcMessageType.GET
  path: PropertyPath
}

export interface RpcApplyMessage<Args> {
  id?: MessageId
  type: RpcMessageType.APPLY
  path: PropertyPath
  args: Args[]
}

export type RpcMessage<Args = unknown> = RpcGetMessage | RpcApplyMessage<Args>

export interface RpcNormalResponse<Result> {
  id: MessageId
  result: Result
}

export interface RpcExceptionResponse<Exception = unknown> {
  id: MessageId
  error: Exception
}

export type RpcResponse<Result = unknown, Exception = unknown> =
  | RpcNormalResponse<Result>
  | RpcExceptionResponse<Exception>

export function isRpcNormalResponse<Result>(
  data: unknown
): data is RpcNormalResponse<Result> {
  return ['id', 'result'].every(
    key => !isNil((data as Record<string, unknown>)[key as keyof typeof data])
  )
}

export function isRpcExceptionResponse<Exception>(
  data: unknown
): data is RpcExceptionResponse<Exception> {
  return ['id', 'error'].every(
    key => !isNil((data as Record<string, unknown>)[key as keyof typeof data])
  )
}

export type InferTransferable<Endpoint> = Endpoint extends
  | WorkerThread
  | WorkerMessagePort // worker message port like
  ? ReadonlyArray<TransferListItem>
  : Endpoint extends Worker | MessagePort // browser like
  ? Transferable
  : never // eg. child_process
