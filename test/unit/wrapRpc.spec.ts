// eslint-disable-next-line import/no-unresolved
import { isProxy } from 'util/types'
import type { Worker as WorkerThread } from 'worker_threads'
import noop from 'lodash/noop'
import { wrapRpc } from '@/index'
import { RpcMessage, RpcResponse } from '@/protocol'

describe('wrapRpc(workerThread)', () => {
  const onMessage = jest.fn()
  const offMessage = jest.fn()
  const postMessage = jest.fn()

  afterEach(() => {
    onMessage.mockReset()
    offMessage.mockReset()
    postMessage.mockReset()
  })

  it('should create a proxy', async () => {
    const rpc = wrapRpc({
      addListener: onMessage,
      removeListener: offMessage,
      postMessage
    } as unknown as WorkerThread)

    expect(isProxy(rpc)).toBeTruthy()
  })

  it('should wrap worker to implement RPC interface', async () => {
    let sendResponse: typeof noop | null = noop
    const onMessage = jest.fn(
      (_, onmessage: (res: RpcResponse<unknown>) => void) => {
        sendResponse = onmessage
      }
    )
    const offMessage = jest.fn(() => {
      sendResponse = null
    })
    const postMessage = jest.fn(({ id }: RpcMessage) =>
      // simulate remote response
      sendResponse?.({ id, result: 'rpc response' })
    )

    const rpc = wrapRpc<{ name: string }>({
      addListener: onMessage,
      removeListener: offMessage,
      postMessage
    } as unknown as WorkerThread)

    expect(await rpc.name).toEqual('rpc response')
    expect(onMessage).toBeCalledTimes(1)
    expect(offMessage).toBeCalledTimes(1)
    expect(postMessage).toBeCalledTimes(1)
  })
})
