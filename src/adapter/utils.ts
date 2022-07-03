import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import {
  AdaptorEvent,
  ConnectionResponseHandler,
  UniversalAdaptor
} from './interface'
import { createUid } from '@/utils'
import {
  InferTransferable,
  isRpcExceptionResponse,
  BrowserEndpoint,
  NodeEndpoint
} from '@/protocol'

export function createRequest<
  Adaptor extends UniversalAdaptor<Client>,
  Client = unknown
>(adaptor: Adaptor) {
  return async function request<Data, Response>(
    data: Data,
    transferable?: InferTransferable<Client>
  ): Promise<Response> {
    const uid = createUid()

    return new Promise<Response>((resolve, reject) => {
      adaptor.on<ConnectionResponseHandler<unknown, Response>, Response>(
        AdaptorEvent.MESSAGE,
        function onmessage(response) {
          if (response?.id !== uid) {
            return
          }
          adaptor.off?.(AdaptorEvent.MESSAGE, onmessage)
          if (isRpcExceptionResponse(response)) {
            return reject(response.error)
          }
          resolve(response.result)
        }
      )
      adaptor.postMessage(Object.assign({ id: uid }, data), transferable)
    })
  }
}

export function checkIsBrowserCompatEndpoint(
  endpoint: unknown
): endpoint is BrowserEndpoint {
  return ['addEventListener', 'removeEventListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}

export function checkIsNodeCompatEndpoint(
  endpoint: unknown
): endpoint is NodeEndpoint {
  return ['addListener', 'removeListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}
