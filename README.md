# rpcs

[![Test cases](https://github.com/lbwa/rpcs/actions/workflows/test.yml/badge.svg)](https://github.com/lbwa/rpcs/actions/workflows/test.yml)

Provides a set of **R**emote **P**rocedure **C**all interface.

## Features

- Use Worker thread, WebWorker without pain
- Always asynchronously and never block main thread
- Call remote method like locals
- Get remote state with Promise

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

## License

MIT © Liu Bowen
