# rpcs

[![Test cases](https://github.com/lbwa/rpcs/actions/workflows/test.yml/badge.svg)](https://github.com/lbwa/rpcs/actions/workflows/test.yml) [![npm version](https://img.shields.io/npm/v/rpcs/latest?style=flat-square)](https://npmjs.com/rpcs)

Provide declarative **type-safe** **R**emote **P**rocedure **C**all interfaces.

## Features

- 💪Always type-safe
- 👷‍♂️Work with Worker thread, Web worker, and MessagePort without pain
- 🆓Keep all actions asynchronously and never block the main thread
- 🤙Declarative remote method & states calling like locals

## Installation

```console
npm i rpcs
```

## Usage

```ts
// remote.ts
import { connectPipe } from 'rpcs'
import { parentPort } from 'worker_threads'

const pipe = {
  name: 'name from remote',
  sayHi() {
    return "hi, I'm from remote side."
  }
}

export type Remote = typeof pipe

connectPipe(pipe, parentPort)
```

```ts
// local.ts
import { connectPipe } from 'rpcs'
import { Worker } from 'worker_threads'
import type { Remote } from './remote' // NOTICE: we only import type from remote for code hints
;(async function main() {
  const rpc = connectPipe<Remote, Worker>(new Worker('./remote.js'))

  const name = await rpc.name // name from remote side
  const hi = await rpc.sayHi('time') // return 'hi, I\'m from remote side.' string
})()
```

> Note: method should always return a value which could be cloned by [HTML structured clone algorithm](https://nodejs.org/dist/latest-v17.x/docs/api/worker_threads.html#considerations-when-cloning-objects-with-prototypes-classes-and-accessors).

## Compatibility

The latest version of rpcs only supports runtime with native [ECMAScript 6(AKA, ES2015)](https://caniuse.com/es6) support.

## License

[MIT](./LICENSE) © [Liu Bowen](https://github.com/lbwa)
