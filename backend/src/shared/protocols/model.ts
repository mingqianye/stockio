/* eslint-disable @typescript-eslint/no-redeclare */

export type BaseClientToServerMessage = {
  user_id: UserId
  ts: Date
}

export type BaseServerToClientMessage = {
  ts: Date
}

export type AmountPrice = {
  amount: Amount
  price: Price
}

export type RoomId = NonEmptyString & {_: 'RoomId'}

export type UserId = NonEmptyString & {_: 'UserId'}

export type Price = NonNegativeNumber & {_: 'Price'}

export type Amount = NonNegativeNumber & {_: 'Amount'}

export type GameClock = NonNegativeNumber & {_: 'GameClock'}

export const RoomId = (s: string) => NonEmptyString(s) as RoomId

export const UserId = (s: string) => NonEmptyString(s) as UserId

export const Price = (n: number) => NonNegativeNumber(n) as Price

export type NonEmptyString = string & {basebrand_: 'NonEmptyString'}

export type NonNegativeNumber = number & {basebrand_: 'NonNegativeNumber'}

export function NonEmptyString(s: string): NonEmptyString {
  if (!(s.length > 0)) {
    throw new TypeError(`${s} is empty and cannot convert to NonEmptyString`);
  }
  return s as NonEmptyString;
}

export function NonNegativeNumber(n: number): NonNegativeNumber {
  if (!(n >= 0)) {
    throw new TypeError( `${n} is negative and cannot convert to NonNegativeNumber.`);
  }
  return n as NonNegativeNumber;
}