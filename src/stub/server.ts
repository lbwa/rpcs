import isFunction from 'lodash/isFunction'
import get from 'lodash/get'
import isNil from 'lodash/isNil'
import {
  RpcEndpoint,
  RpcExceptionResponse,
  MessageId,
  RpcNormalResponse,
  RpcMessage,
  RpcMessageType
} from '../protocol'
import { enhanceConnection } from '@/adapter'
import { AdaptorEvent } from '@/adapter/interface'

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

export function exposePipe<
  Value extends Record<string, unknown>,
  Endpoint extends RpcEndpoint
>(value: Value, endpoint: Endpoint) {
  const conn = enhanceConnection(endpoint)
  conn.on(
    AdaptorEvent.MESSAGE,
    async function onmessage(
      this: typeof conn,
      message: RpcMessage = {} as RpcMessage
    ) {
      if (isNil(message?.id)) return

      const target = get(value, message.path) as unknown
      try {
        switch (message.type) {
          case RpcMessageType.GET:
            return this.postMessage(createRpcNormalResult(message.id, target))
          case RpcMessageType.APPLY:
            if (!isFunction(target)) {
              throw new Error(
                `<REMOTE>.${message.path?.join('.')} is NOT callable.`
              )
            }
            return this.postMessage(
              createRpcNormalResult(
                message.id,
                await target.apply(
                  get(value, message.path?.slice(0, -1), value),
                  message.args
                )
              )
            )
          default:
            throw new Error(
              // code defenses
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              `Unknown action type: ${(message as any).type as string}`
            )
        }
      } catch (error) {
        this.postMessage(createRpcExceptionResponse(message.id, error as Error))
      }
    }
  )
}
