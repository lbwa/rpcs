import { UniversalAdaptor } from './interface'
import { RpcEndpoint } from '@/protocol'

const UNKNOWN_WARNING = `Occur unknown endpoint.`

export class UnknownAdaptor implements UniversalAdaptor<RpcEndpoint> {
  constructor(public client: RpcEndpoint) {}

  on(): void {
    throw new Error(UNKNOWN_WARNING)
  }

  postMessage(): void {
    throw new Error(UNKNOWN_WARNING)
  }
}
