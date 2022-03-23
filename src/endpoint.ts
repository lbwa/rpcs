import type { TransferListItem, Worker } from 'worker_threads'
import pick from 'lodash/pick'
import isNil from 'lodash/isNil'
import { Endpoint } from './protocol'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => void

export function createWorkerThreadEndpoint(
  worker: Worker
): Endpoint<TransferListItem> {
  return {
    addEventListener(event: string, callback: Callback) {
      return worker.addListener(event, callback)
    },
    removeEventListener(event: string, callback: Callback) {
      return worker.removeListener(event, callback)
    },
    ...pick(worker, 'postMessage')
  }
}

export function createProcessEndpoint(
  process: NodeJS.Process
): Endpoint<TransferListItem> {
  return {
    addEventListener(event: string & NodeJS.Signals, callback: Callback) {
      return process.addListener(event, callback)
    },
    removeEventListener(event: string & NodeJS.Signals, callback: Callback) {
      return process.removeListener(event, callback)
    },
    postMessage(value) {
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        if (isNil(process.send)) {
          return reject(
            new Error(`Process ${process.pid} doesn't have IPC channels.`)
          )
        }
        return process.send(value, undefined, undefined, error => {
          if (isNil(error)) {
            return resolve(void 0)
          }
          reject(error)
        })
      })
    }
  }
}
