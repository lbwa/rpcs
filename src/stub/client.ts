import noop from 'lodash/noop'
import isSymbol from 'lodash/isSymbol'
import { RpcEndpoint, RpcMessageType } from '../protocol'
import { Remote } from './stub'
import { enhanceConnection } from '@/adapter'

function createProxy<T, Endpoint extends RpcEndpoint>(
  endpoint: Endpoint,
  path: string[]
): Remote<T> {
  const conn = enhanceConnection(endpoint)
  const proxy = new Proxy(noop, {
    get(_, prop) {
      // make `await p.remoteProp` works
      if (prop === 'then') {
        if (path.length < 1) {
          // thenable object
          return { then: () => proxy }
        }

        const ans = conn.request({
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
      return conn.request({
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
