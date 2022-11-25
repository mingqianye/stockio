/* eslint-disable @typescript-eslint/no-redeclare */

export type AmountPrice = {
  amount: Amount
  price: Price
}

export type Team = {
  userIds: UserId[]
}

export type TeamId = NonEmptyString

export type RoomId = NonEmptyString

export type UserId = NonEmptyString

export type Price = NonNegativeNumber

export type Amount = NonNegativeNumber

export type GameClock = NonNegativeNumber

export const RoomId = (s: string) => NonEmptyString(s)

export const UserId = (s: string) => NonEmptyString(s)

export const Price = (n: number) => NonNegativeNumber(n)

export type NonEmptyString = string

export type NonNegativeNumber = number

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