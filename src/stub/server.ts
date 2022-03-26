import isFunction from 'lodash/isFunction'
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

export function createRpcNormalResult<Result>(
  id: MessageId,
  result: Result
): RpcNormalResponse<Result> {
  return { id, result }
}

export function createRpcExceptionResponse<Exception>(
  id: MessageId,
  exception: Exception
): RpcExceptionResponse<Exception> {
  return { id, error: exception }
}

export function exposeRpc(value: unknown, endpoint: Endpoint) {
  registerMessageListener(
    endpoint,
    function onmessage(message: RpcMessage = {} as RpcMessage) {
      const { id, path = [], type } = message
      if (isNil(id)) {
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const current = get(value, path),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        parent = get(value, path.slice(0, -1), value)
      try {
        switch (type) {
          case RpcMessageType.GET:
            return endpoint.postMessage(
              createRpcNormalResult(id, get(value, path))
            )
          case RpcMessageType.APPLY:
            if (isFunction(current)) {
              return endpoint.postMessage(
                createRpcNormalResult(id, current.apply(parent, message.args))
              )
            }
            throw new Error(
              `<REMOTE>.${path.join('.')} isn't a callable function.`
            )
          default:
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new Error(`Unknown message type ${type}`)
        }
      } catch (error) {
        endpoint.postMessage(
          createRpcExceptionResponse(id, (error as Error)?.message ?? error)
        )
      }
    }
  )
}
