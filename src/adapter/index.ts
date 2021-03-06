import { Worker as WorkerThread } from 'worker_threads'
import { WorkerThreadAdaptor } from './worker_thread'
import { UniversalAdaptor } from './interface'
import { UnknownAdaptor } from './unknown'
import {
  checkIsBrowserCompatEndpoint,
  checkIsNodeCompatEndpoint
} from './utils'
import { BrowserAdaptor } from './browser'
import { RpcEndpoint } from '@/protocol'

export function enhanceConnection(
  endpoint: RpcEndpoint
): UniversalAdaptor<RpcEndpoint> {
  if (checkIsNodeCompatEndpoint(endpoint)) {
    return new WorkerThreadAdaptor(endpoint as WorkerThread)
  }

  if (checkIsBrowserCompatEndpoint(endpoint)) {
    return new BrowserAdaptor(endpoint)
  }

  return new UnknownAdaptor(endpoint)
}
