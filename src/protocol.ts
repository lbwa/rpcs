import type { Worker as WorkerThread } from 'worker_threads'
import type { PropertyPath } from 'lodash'
import isNil from 'lodash/isNil'

export type Endpoint = Worker /* web worker */ | WorkerThread

export type MessageId = string

export enum RpcMessageType {
  GET
}

export interface RpcGetMessage {
  id?: MessageId
  type: RpcMessageType.GET
  path: PropertyPath[]
}

export type RpcMessage = RpcGetMessage

export interface NormalResponse<Result> {
  id: MessageId
  result: Result
}

export interface ExceptionResponse<Exception = unknown> {
  id: MessageId
  error: Exception
}

export type RpcResponse<Result = unknown, Exception = unknown> =
  | NormalResponse<Result>
  | ExceptionResponse<Exception>

export function isRpcNormalResponse<Result>(
  data: unknown
): data is NormalResponse<Result> {
  return ['id', 'result'].every(
    key => !isNil((data as Record<string, unknown>)[key as keyof typeof data])
  )
}

export function isRpcExceptionResponse<Exception>(
  data: unknown
): data is ExceptionResponse<Exception> {
  return ['id', 'error'].every(
    key => !isNil((data as Record<string, unknown>)[key as keyof typeof data])
  )
}
