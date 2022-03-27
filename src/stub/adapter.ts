import { TransferListItem } from 'worker_threads'
import get from 'lodash/get'
import isFunction from 'lodash/isFunction'
import { UniversalFunc } from './stub'
import { RpcEndpoint, NodeJsEndpoint, BrowserEndpoint } from '@/protocol'

export function isWebEndpoint(endpoint: unknown): endpoint is BrowserEndpoint {
  return ['addEventListener', 'removeListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}

export function isNodeJsEndpoint(
  endpoint: unknown
): endpoint is NodeJsEndpoint {
  return ['addListener', 'removeListener', 'postMessage'].every(m =>
    isFunction(get(endpoint, m))
  )
}

export function registerMessageListener<
  Endpoint extends RpcEndpoint,
  OnMessage extends UniversalFunc
>(endpoint: Endpoint, onMessage: OnMessage) {
  if (isWebEndpoint(endpoint)) {
    endpoint.addEventListener('message', onMessage)
  }
  if (isNodeJsEndpoint(endpoint)) {
    endpoint.addListener('message', onMessage)
  }
}

export function unregisterMessageListener<
  Endpoint extends RpcEndpoint,
  OnMessage extends UniversalFunc
>(endpoint: Endpoint, onMessage: OnMessage) {
  if (isWebEndpoint(endpoint)) {
    endpoint.removeEventListener('message', onMessage)
  }
  if (isNodeJsEndpoint(endpoint)) {
    endpoint.removeListener('message', onMessage)
  }
}

export function sendRpcMessage<
  Endpoint extends RpcEndpoint,
  TransferableList extends Transferable[]
>(endpoint: Endpoint, value: unknown, transferList?: TransferableList): void
export function sendRpcMessage<
  Endpoint extends RpcEndpoint,
  TransferableList extends ReadonlyArray<TransferListItem>
>(endpoint: Endpoint, value: unknown, transferList?: TransferableList): void
export function sendRpcMessage<
  Endpoint extends RpcEndpoint,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TransferableList extends any[]
>(endpoint: Endpoint, value: unknown, transferList?: TransferableList) {
  if (isWebEndpoint(endpoint)) {
    endpoint.postMessage(value, transferList ?? [])
  }
  if (isNodeJsEndpoint(endpoint)) {
    endpoint.postMessage(value, transferList)
  }
}
