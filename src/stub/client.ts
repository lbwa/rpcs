import noop from 'lodash/noop'
import isSymbol from 'lodash/isSymbol'
import {
  Endpoint,
  RpcMessage,
  RpcMessageType,
  RpcResponse,
  isRpcExceptionResponse
} from '../protocol'
import { createUuid } from '../utils'
import { Remote } from './stub'

function sendMessage<Response, Transferable extends ArrayBuffer>(
  endpoint: Endpoint,
  msg: RpcMessage,
  transfer?: Transferable[]
) {
  return new Promise<Response>((resolve, reject) => {
    const id = createUuid()
    endpoint.addEventListener(
      'message',
      function onmessage(response: RpcResponse<Response>) {
        if (response.id !== id) {
          return
        }
        endpoint.removeEventListener('message', onmessage)
        if (isRpcExceptionResponse(response)) {
          return reject(response.error)
        }
        resolve(response.result)
      }
    )
    endpoint.postMessage({ id, ...msg }, transfer)
  })
}

function createProxy<T>(endpoint: Endpoint, path: string[]): Remote<T> {
  const proxy = new Proxy(noop, {
    get(_, prop) {
      // make `await p.remoteProp` works
      if (prop === 'then') {
        if (path.length < 1) {
          // thenable object
          return { then: () => proxy }
        }

        const ans = sendMessage(endpoint, {
          type: RpcMessageType.GET,
          path
        })
        return ans.then.bind(ans)
      }

      if (isSymbol(prop)) {
        return Promise.reject(
          new Error(`Unsupported "prop" type: ${typeof prop}`)
        )
      }
      return createProxy(endpoint, [...path, prop])
    }
  }) as Remote<T>
  return proxy
}

export function wrapRpc<T>(endpoint: Endpoint): Remote<T> {
  return createProxy<T>(endpoint, [])
}
