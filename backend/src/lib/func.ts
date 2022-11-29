import * as O from "fp-ts/lib/Option";
import { pipe, } from "fp-ts/lib/function";
import update, {Spec} from 'immutability-helper';
import { array, tuple } from "fp-ts";

export function isEqual<T>(a: T, oa: O.Option<T>): boolean {
  return O.match(() => false, (a2) => a == a2)(oa)
}

export function updateFn<T>(spec: Spec<T, never>) {
  return (t: T) => update(t, spec)
}

export function updateRecords<K extends string, V>(
  record: Record<K, V>, 
  keys: K[], 
  f: (value: V) =>V): Record<K, V> {
  return pipe(
    keys,
    array.map(k => ({key: k, value: f(record[k])})),
    array.reduce(record, (oldRecord, newEntry) => ({
      ...oldRecord,
      [newEntry.key]: newEntry.value
    }))
  )
}