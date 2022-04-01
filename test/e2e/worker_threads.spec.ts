import path from 'path'
import { Worker } from 'worker_threads'

describe('worker_threads', () => {
  let handler: any
  let worker: Worker
  beforeAll(() => {
    worker = new Worker(
      path.resolve(__dirname, './fixtures/worker_threads/worker.js')
    )
    handler = require('../../dist/index.cjs').wrapRpc(worker)
  })

  afterAll(async () => {
    await worker?.terminate()
    handler = null
  })

  it('should get state calling', async () => {
    expect(await handler.primitive).toEqual(1)
    expect(await handler.object).toEqual({ name: 'worker name' })
    expect(await handler.promise).toBeUndefined()
  })

  it('should get method calling', async () => {
    expect(await handler.getNumber(1)).toEqual(1)
    expect(await handler.getNumber()).toEqual(12)
    expect(await handler.returnPromise(2)).toEqual(2)
    expect(await handler.returnPromise()).toEqual(12)
    await expect(async () => {
      await handler.returnReject()
    }).rejects.toMatchSnapshot('catch reject promise')
  })

  it('should catch unavailable calling', async () => {
    await expect(async () => {
      await handler.randomCall()
    }).rejects.toMatchSnapshot('catch unavailable calling')
    await worker.terminate()
  })
})
