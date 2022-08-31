import EventEmitter from 'events'
import { Worker as WorkerThread } from 'worker_threads'
import { exposePipe } from '@/index'
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
    exposePipe(data, ee)
    ee.emit('message')
    expect(postMessage).not.toBeCalled()
  })

  class People {
    person = { name: 'person name ' }
    isClass = true
  }

  const people = { person: { name: 'person name' } }

  it.each([people, new People()])(
    'should return remote property value with data: %o',
    async data => {
      const ee = new EventEmitter() as WorkerThread
      const postMessage = jest.fn()
      Object.assign(ee, {
        postMessage
      })
      exposePipe(data, ee)

      {
        ee.emit('message', {
          id: 12,
          path: ['person', 'name']
        })
        expect(postMessage).toBeCalledTimes(1)
        const [response] = (postMessage.mock.calls[0] ?? []) as [
          RpcExceptionResponse<Error>
        ]
        expect(response.id).toEqual(12)
        expect(
          (response as unknown as RpcNormalResponse<unknown>).result
        ).toBeUndefined()
        expect(response.error.message).toMatchSnapshot(
          `expect unknown message type with ${JSON.stringify(data)}`
        )
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
    }
  )

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
    exposePipe(data, ee)

    {
      ee.emit('message', {
        id: 1234,
        type: RpcMessageType.APPLY,
        path: ['getField'],
        args: ['name']
      })
      await Promise.resolve()
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
      await Promise.resolve()
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

  it('should return rejected promises', async () => {
    const ee = new EventEmitter() as WorkerThread
    const postMessage = jest.fn()
    Object.assign(ee, { postMessage })
    const errorMessage = 'error from getThrow()'
    const data = {
      getThrow() {
        throw new Error(errorMessage)
      }
    }
    exposePipe(data, ee)

    {
      ee.emit('message', {
        id: 1,
        type: RpcMessageType.APPLY,
        path: ['getThrow'],
        args: []
      })

      await Promise.resolve()
      expect(postMessage).toBeCalledTimes(1)
      const [response] = (postMessage.mock.calls[0] ?? []) as [
        RpcExceptionResponse<Error>
      ]
      expect(response.id).toEqual(1)
      expect(response.error.message).toEqual(errorMessage)
      expect(
        (response as unknown as RpcNormalResponse<unknown>).result
      ).toBeUndefined()
    }
  })
})
