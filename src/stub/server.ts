import get from 'lodash/get'
import isNil from 'lodash/isNil'
import {
  Endpoint,
  ExceptionResponse,
  MessageId,
  NormalResponse,
  RpcMessage
} from '../protocol'
import { registerMessageListener } from './method'

function createRcpNormalResult<Result>(
  id: MessageId,
  result: Result
): NormalResponse<Result> {
  return { id, result }
}

export function createRcpExceptionResponse<Exception>(
  id: MessageId,
  exception: Exception
): ExceptionResponse<Exception> {
  return { id, error: exception }
}

export function exposeRpc(value: unknown, endpoint: Endpoint) {
  registerMessageListener(
    endpoint,
    function onmessage({ id, path }: RpcMessage) {
      if (isNil(id)) {
        return
      }
      try {
        endpoint.postMessage(
          createRcpNormalResult(id, get(value, path.join('.')))
        )
      } catch (error) {
        endpoint.postMessage(createRcpExceptionResponse(id, error))
      }
    }
  )
}
