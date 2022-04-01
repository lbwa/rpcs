const { parentPort } = require('worker_threads')
const { exposeRpc } = require('../../../../dist/index.cjs')

exposeRpc(
  {
    primitive: 1,
    object: { name: 'worker name' },
    getNumber(arg) {
      return arg || 12
    },
    returnPromise(arg) {
      return Promise.resolve(arg || 12)
    },
    returnReject() {
      return Promise.reject('rejected promises from worker thread')
    }
  },
  parentPort
)
