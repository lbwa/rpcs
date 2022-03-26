import EventEmitter from 'events'
import { Worker as WorkerThread } from 'worker_threads'
import { exposeRpc } from '@/index'
import {
  RpcExceptionResponse,
  RpcNormalResponse,
  RpcMessageType
} from '@/protocol'

describe('exposeRpc(value, endpoint)', () => {
  it(`shouldn't response without json-rpc 2.0 id`, async () => {
    const ee = new EventEmitter() as WorkerThread
    const postMessage = jest.fn()
    Object.assign(ee, {
      postMessage
    })
    const data = { person: { name: 'person name' } }
    exposeRpc(data, ee)
    ee.emit('message')
    expect(postMessage).not.toBeCalled()
  })

  it('should return remote property value', async () => {
    const ee = new EventEmitter() as WorkerThread
    const postMessage = jest.fn()
    Object.assign(ee, {
      postMessage
    })
    const data = { person: { name: 'person name' } }
    exposeRpc(data, ee)

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
      expect(
        (response as unknown as RpcExceptionResponse).error
      ).toBeUndefined()
      expect(response.result).toEqual(data.person.name)
    }
  })

  it('should response remote method call', async () => {
    const ee = new EventEmitter() as WorkerThread
    const postMessage = jest.fn()
    Object.assign(ee, { postMessage })
    const data = {
      name: 'data.name',
      getField(field: string) {
        return this[field as keyof typeof data]
      },
      provide: {
        time(base: number, time: number) {
          return base * time
        }
      }
    }
    exposeRpc(data, ee)

    {
      ee.emit('message', {
        id: 1234,
        type: RpcMessageType.APPLY,
        path: ['getField'],
        args: ['name']
      })
      expect(postMessage).toBeCalledTimes(1)
      const [response] = (postMessage.mock.calls[0] ?? []) as [
        RpcNormalResponse<string>
      ]
      expect(response.id).toEqual(1234)
      expect(
        (response as unknown as RpcExceptionResponse).error
      ).toBeUndefined()
      expect(response.result).toEqual(data.name)
    }

    postMessage.mockReset()

    {
      ee.emit('message', {
        id: 2345,
        type: RpcMessageType.APPLY,
        path: ['provide', 'time'],
        args: [2, 3]
      })
      expect(postMessage).toBeCalledTimes(1)
      const [response] = (postMessage.mock.calls[0] ?? []) as [
        RpcNormalResponse<number>
      ]
      expect(response.id).toEqual(2345)
      expect(
        (response as unknown as RpcExceptionResponse).error
      ).toBeUndefined()
      expect(response.result).toEqual(6)
    }
  })
})
