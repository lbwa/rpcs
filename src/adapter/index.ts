import { Worker as WorkerThread } from 'worker_threads'
import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import { WorkerThreadAdaptor } from './worker_thread'
import { UniversalAdaptor } from './interface'
import { BrowserClient, NodeJsClient, RpcEndpoint } from '@/protocol'

export function isWebEndpoint(endpoint: unknown): endpoint is BrowserClient {
  return ['addEventListener', 'removeEventListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}

export function isNodeJsEndpoint(endpoint: unknown): endpoint is NodeJsClient {
  return ['addListener', 'removeListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}

export function enhanceConnection(
  endpoint: RpcEndpoint
): UniversalAdaptor<WorkerThread> {
  if (isNodeJsEndpoint(endpoint)) {
    return new WorkerThreadAdaptor(endpoint as WorkerThread)
  }
}
