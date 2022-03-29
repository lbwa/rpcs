# rpcs

[![Test cases](https://github.com/lbwa/rpcs/actions/workflows/test.yml/badge.svg)](https://github.com/lbwa/rpcs/actions/workflows/test.yml) [![npm version](https://img.shields.io/npm/v/rpcs/latest?style=flat-square)](https://npmjs.com/rpcs)

Provides a set of **R**emote **P**rocedure **C**all interface.

## Features

- 👷‍♂️Use Worker thread, WebWorker, MessagePort without pain
- 🆓Keep all actions asynchronously and never block main thread
- 🤙Call remote methods asynchronously like locals
- 📞Get remote states asynchronously like locals

## Installation

```console
npm i rpcs
```

## Usage

```ts
import { wrapRpc } from 'rpcs'
import { Worker } from 'worker_threads'
;(async function main() {
  const rpc = wrapRpc(new Worker('./worker.mjs'))

  const remoteName = await rpc.name
  const remoteTime = await rpc.getField('time')
})()
```

```ts
import { exposeRpc } from 'rpcs'
import { parentPort } from 'worker_threads'

exposeRpc(
  {
    name: 'remote name',
    time: Date.now(),
    getField() {
      return this.time
    }
  },
  parentPort
)
```

> Note: method should always return a value which could be cloned by [HTML structured clone algorithm](https://nodejs.org/dist/latest-v17.x/docs/api/worker_threads.html#considerations-when-cloning-objects-with-prototypes-classes-and-accessors).

## Compatibility

Our implementation is built on top of Proxy([Node.js compatibility](https://node.green/#ES2015-built-ins-Proxy) and [Browser compatibility](https://caniuse.com/?search=Proxy)) object and Worker/MessagePort interface.

## License

[MIT](./LICENSE) © [Liu Bowen](https://github.com/lbwa)
