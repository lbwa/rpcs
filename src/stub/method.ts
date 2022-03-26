import type { Worker as WorkerThread } from 'worker_threads'
import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import { UniversalFunc } from './stub'
import { Endpoint } from '@/protocol'

export function isWebWorkerInterface(endpoint: unknown): endpoint is Worker {
  return ['addEventListener', 'removeListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}

export function isWorkerThreadInterface(
  endpoint: unknown
): endpoint is WorkerThread {
  return ['addListener', 'removeListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}

export function registerMessageListener<OnMessage extends UniversalFunc>(
  endpoint: Endpoint,
  onMessage: OnMessage
) {
  if (isWebWorkerInterface(endpoint)) {
    endpoint.addEventListener('message', onMessage)
  }
  if (isWorkerThreadInterface(endpoint)) {
    endpoint.addListener('message', onMessage)
  }
}

export function unregisterMessageListener<OnMessage extends UniversalFunc>(
  endpoint: Endpoint,
  onMessage: OnMessage
) {
  if (isWebWorkerInterface(endpoint)) {
    endpoint.removeEventListener('message', onMessage)
  }
  if (isWorkerThreadInterface(endpoint)) {
    endpoint.removeListener('message', onMessage)
  }
}
