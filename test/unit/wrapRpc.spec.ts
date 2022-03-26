// eslint-disable-next-line import/no-unresolved
import { isProxy } from 'util/types'
import { Worker as WorkerThread } from 'worker_threads'
import noop from 'lodash/noop'
import { wrapRpc } from '@/index'
import { RpcMessage, RpcMessageType, RpcResponse } from '@/protocol'

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

  it('should get remote property value', async () => {
    let sendResponse = noop
    const onMessage = jest.fn(
      (_, onmessage: (res: RpcResponse<unknown>) => void) => {
        sendResponse = onmessage
      }
    )
    const offMessage = jest.fn(() => {
      sendResponse = noop
    })
    const postMessage = jest.fn(({ id }: RpcMessage) =>
      // simulate remote response
      sendResponse({ id, result: 'rpc response' })
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

  it("shouldn't emit value in a symbol", async () => {
    const rpc = wrapRpc<{ name: string }>({
      addListener: onMessage,
      removeListener: offMessage,
      postMessage
    } as unknown as WorkerThread)

    await expect(
      // @ts-expect-error illegal usage
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      (async () => await rpc[Symbol('name')])()
    ).rejects.toMatchSnapshot()
  })

  it('should call remote function', async () => {
    const remoteCallReturn = 'remote getField("name") call'
    let sendResponse = noop
    const onMessage = jest.fn(
      (_, onmessage: (res: RpcResponse<unknown>) => void) => {
        sendResponse = onmessage
      }
    )
    const offMessage = jest.fn(() => {
      sendResponse = noop
    })
    const postMessage = jest.fn((message: RpcMessage) => {
      // simulate remote response
      const { id, type } = message
      if (type === RpcMessageType.APPLY) {
        const { args } = message
        if (args.length === 1 && args[0] === 'name') {
          sendResponse({ id, result: remoteCallReturn })
          return
        }
      }
      throw new Error('Exception')
    })
    const rpc = wrapRpc<{ getField(name: string): string }>({
      addListener: onMessage,
      removeListener: offMessage,
      postMessage
    } as unknown as WorkerThread)

    expect(await rpc.getField('name')).toEqual(remoteCallReturn)
  })
})
