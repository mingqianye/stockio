import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { WritableDraft } from "immer/dist/internal";

export function getValues<K, V>(map: ReadonlyMap<K, V>) {
  return Array.from(map.values())
}

export function getOption<K, V>(map: ReadonlyMap<K, V>, key: K): O.Option<V> {
  return O.fromNullable(map.get(key))
}

export function updateIfExists<K, V>(
  map: WritableDraft<Map<K, WritableDraft<V>>>, 
  key: K, 
  updateFn: (v: WritableDraft<V>) => unknown) {

  pipe(
    map.get(key),
    O.fromNullable,
    O.map(v => updateFn(v))
  )
  return map
}

export function isEqual<T>(a: T, oa: O.Option<T>): boolean {
  return O.match(() => false, (a2) => a == a2)(oa)
}
