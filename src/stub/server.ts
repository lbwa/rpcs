import get from 'lodash/get'
import isNil from 'lodash/isNil'
import {
  Endpoint,
  RpcExceptionResponse,
  MessageId,
  RpcNormalResponse,
  RpcMessage,
  RpcMessageType
} from '../protocol'
import { registerMessageListener } from './method'

export function createRcpNormalResult<Result>(
  id: MessageId,
  result: Result
): RpcNormalResponse<Result> {
  return { id, result }
}

export function createRcpExceptionResponse<Exception>(
  id: MessageId,
  exception: Exception
): RpcExceptionResponse<Exception> {
  return { id, error: exception }
}

export function exposeRpc(value: unknown, endpoint: Endpoint) {
  registerMessageListener(
    endpoint,
    function onmessage({ id, path, type }: RpcMessage = {} as RpcMessage) {
      if (isNil(id)) {
        return
      }
      try {
        if (type === RpcMessageType.GET) {
          return endpoint.postMessage(
            createRcpNormalResult(id, get(value, path))
          )
        }
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw new Error(`Unknown message type ${type}`)
      } catch (error) {
        endpoint.postMessage(
          createRcpExceptionResponse(id, (error as Error)?.message ?? error)
        )
      }
    }
  )
}
