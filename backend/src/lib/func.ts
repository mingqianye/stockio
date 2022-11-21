import { pipe } from "fp-ts/lib/function";

export function findAllInValues<K, V>(map: ReadonlyMap<K, V>, predicate: (v: V) => boolean): V[]{
  return pipe(
    map,
    (m: ReadonlyMap<K, V>) => m.values(),
    Array.from,
    (arr: V[]) => arr.filter(predicate),
  )
}