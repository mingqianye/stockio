import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

export function findAllInValues<K, V>(map: ReadonlyMap<K, V>, predicate: (v: V) => boolean): V[]{
  return pipe(
    map,
    (m: ReadonlyMap<K, V>) => m.values(),
    Array.from,
    (arr: V[]) => arr.filter(predicate),
  )
}

export function isEqual<T>(a: T, oa: O.Option<T>): boolean {
  return O.match(() => false, (a2) => a == a2)(oa)
}