type Promisify<T> = T extends Promise<unknown> ? T : Promise<T>

type RemoteProp<T> = T extends (...args: unknown[]) => unknown
  ? Remote<T>
  : Promisify<T>

type RemoteDic<T> = {
  [P in keyof T]: RemoteProp<T[P]>
}

export type Remote<T> = RemoteDic<T> &
  (T extends (...args: infer Args) => infer Return
    ? (...args: { [I in keyof Args]: Args[I] }) => Promisify<Return>
    : unknown)
