import EventEmitter from 'events'
import { Worker as WorkerThread } from 'worker_threads'
import { exposeRpc } from '@/index'
import {
  RpcExceptionResponse,
  RpcNormalResponse,
  RpcMessageType
} from '@/protocol'

describe('exposeRpc(value, endpoint)', () => {
  it('should expose worker scope to provide functionalities', async () => {
    const ee = new EventEmitter() as WorkerThread
    const postMessage = jest.fn()
    Object.assign(ee, {
      postMessage
    })
    const data = { person: { name: 'person name' } }
    exposeRpc(data, ee)
    ee.emit('message')
    expect(postMessage).not.toBeCalled()

    {
      ee.emit('message', {
        id: 12,
        path: ['person', 'name']
      })
      expect(postMessage).toBeCalledTimes(1)
      const [response] = (postMessage.mock.calls[0] ?? []) as [
        RpcExceptionResponse
      ]
      expect(response.id).toEqual(12)
      expect(
        (response as unknown as RpcNormalResponse<unknown>).result
      ).toBeUndefined()
      expect(response.error).toMatchSnapshot('expect unknown message type')
      postMessage.mockReset()
    }

    {
      ee.emit('message', {
        id: 123,
        path: ['person', 'name'],
        type: RpcMessageType.GET
      })
      expect(postMessage).toBeCalledTimes(1)
      const [response] = (postMessage.mock.calls[0] ?? []) as [
        RpcNormalResponse<string>
      ]
      expect(response.id).toEqual(123)
      expect(response.result).toEqual(data.person.name)
    }
  })
})
