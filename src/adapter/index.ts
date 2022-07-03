import { Worker as WorkerThread } from 'worker_threads'
import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import { WorkerThreadAdaptor } from './worker_thread'
import { UniversalAdaptor } from './interface'
import { UnknownAdaptor } from './unknown'
import { BrowserEndpoint, NodeEndpoint, RpcEndpoint } from '@/protocol'

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

export function enhanceConnection(
  endpoint: RpcEndpoint
): UniversalAdaptor<RpcEndpoint> {
  if (checkIsNodeCompatEndpoint(endpoint)) {
    return new WorkerThreadAdaptor(endpoint as WorkerThread)
  }

  if (checkIsBrowserCompatEndpoint(endpoint)) {
    // TODO: browser compat adaptor
  }

  return new UnknownAdaptor(endpoint)
}
