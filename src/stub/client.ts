import noop from 'lodash/noop'
import isSymbol from 'lodash/isSymbol'
import {
  RpcEndpoint,
  RpcMessage,
  RpcMessageType,
  RpcResponse,
  isRpcExceptionResponse,
  RpcGetMessage,
  RpcApplyMessage
} from '../protocol'
import { createUuid } from '../utils'
import { Remote } from './stub'
import {
  registerMessageListener,
  sendRpcMessage,
  unregisterMessageListener
} from './adapter'

function sendMessage<
  Endpoint extends RpcEndpoint,
  Response,
  Transferable extends ArrayBuffer
>(
  endpoint: Endpoint,
  msg: RpcGetMessage,
  transfer?: Transferable[]
): Promise<Response>
function sendMessage<
  Endpoint extends RpcEndpoint,
  Response,
  Transferable extends ArrayBuffer
>(
  endpoint: Endpoint,
  msg: RpcApplyMessage,
  transfer?: Transferable[]
): Promise<Response>
function sendMessage<
  Endpoint extends RpcEndpoint,
  Response,
  Transferable extends ArrayBuffer
>(
  endpoint: Endpoint,
  msg: RpcMessage,
  transfer?: Transferable[]
): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const id = createUuid()

    registerMessageListener(
      endpoint,
      function onmessage(response: RpcResponse<Response>) {
        if (response.id !== id) {
          return
        }
        unregisterMessageListener(endpoint, onmessage)
        if (isRpcExceptionResponse(response)) {
          return reject(response.error)
        }
        resolve(response.result)
      }
    )
    sendRpcMessage(endpoint, { id, ...msg }, transfer)
  })
}

function createProxy<T, Endpoint extends RpcEndpoint>(
  endpoint: Endpoint,
  path: string[]
): Remote<T> {
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
    },
    apply(_target, _this, args) {
      const last = path[path.length - 1]
      if (last === 'bind') {
        return createProxy(endpoint, path.slice(0, -1))
      }
      return sendMessage(endpoint, {
        type: RpcMessageType.APPLY,
        path,
        args
      })
    }
  }) as Remote<T>
  return proxy
}

export function wrapRpc<T, Endpoint extends RpcEndpoint = RpcEndpoint>(
  endpoint: Endpoint
): Remote<T> {
  return createProxy<T, Endpoint>(endpoint, [])
}
