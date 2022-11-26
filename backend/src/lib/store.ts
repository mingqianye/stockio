import * as m from "../shared/protocols/model"
import { castImmutable, Immutable } from "immer"
import { createSelector } from "reselect"
import { getOption, getValues, isEqual } from "./func"
import { fromNullable } from "fp-ts/lib/Option"
import { map } from "fp-ts/lib/Functor"
import { pipe, flow } from "fp-ts/lib/function"
import * as O from "fp-ts/lib/Option";
import { match, P } from "ts-pattern"
import { filter } from "fp-ts/lib/ReadonlyNonEmptyArray"
import { array, predicate, readonlyArray } from "fp-ts"

export type Store = {
  entities: Immutable<Entities>
}

export type Entities = {
  users: Map<UserId, User>
  waitlists: Map<WaitlistId, Waitlist>
  rooms: Map<RoomId, Room>
  teams: Map<TeamId, Team>
  games: Map<GameId, Game>
}

export type User = {
  id: UserId
  status: 
    | { type: 'IDLE' }
    | { type: 'IN_WAITLIST', waitlistId: WaitlistId } 
    | { type: 'IN_TEAM', teamId: TeamId }
}

export type Waitlist = {
  id: WaitlistId
}

export type Room = {
  id: RoomId
  status: 'WAITING' | 'GAME_STARTED'
}

export type Team = {
  id: TeamId
  status: {
    type: 'IN_ROOM'
    roomId: RoomId
  } | {
    type: 'IN_GAME'
    gameId: GameId
  }
}

export type Game = {
  id: GameId
  status: 'ACTIVE' | 'COMPLETED'
  price: m.Price
  gameClock: m.GameClock
  ts: Date
}

export type UserId = m.UserId & {_: 'UserId'}
export type TeamId = m.TeamId & {_: 'TeamId'}
export type RoomId = m.RoomId & {_: 'RoomId'}
export type GameId = string & {_: 'GameId'}
export type WaitlistId = string & {_: 'WaitlistId'}

const store: Store = {
  entities: {
    users: new Map(),
    waitlists: new Map(),
    teams: new Map(),
    rooms: new Map(),
    games: new Map()
  }
}

export const getEntities = () => store.entities
export const setEntities = (entities: Immutable<Entities>) => store.entities = entities

export const selectTeamByUserId = (entities: Immutable<Entities>, userId: UserId): O.Option<TeamId> =>
  pipe(
    getOption(entities.users, userId),
    O.chain(u => match(u.status)
      .with({type: 'IN_TEAM', teamId: P.select()}, teamId => O.of(teamId))
      .otherwise(() => O.none)))

export const selectRoomByTeamId = (entities: Immutable<Entities>, teamId: TeamId): O.Option<RoomId> =>
  pipe(
    getOption(entities.teams, teamId),
    O.chain(team => match(team.status)
      .with({type: 'IN_ROOM', roomId: P.select()}, roomId => O.of(roomId))
      .otherwise(() => O.none)))

export const selectRoomByUserId = (entities: Immutable<Entities>, userId: UserId): O.Option<RoomId> =>
  pipe(
    selectTeamByUserId(entities, userId),
    O.chain(teamId => selectRoomByTeamId(entities, teamId))
  )

export const selectGameByTeamId = (entities: Immutable<Entities>, teamId: TeamId): O.Option<GameId> =>
  pipe(
    getOption(entities.teams, teamId),
    O.chain(team => match(team.status)
      .with({type: "IN_GAME", gameId: P.select()}, gameId => O.of(gameId))
      .otherwise(() => O.none)))

export const selectUsersByTeamId = (entities: Immutable<Entities>, teamId: TeamId): UserId[] =>
  pipe(
    getValues(entities.users),
    array.map(user => user.id),
    array.filter(userId => isEqual(teamId, selectTeamByUserId(entities, userId)))
  )

export const selectTeamsByRoomId = (entities: Immutable<Entities>, roomId: RoomId): TeamId[] =>
  pipe(
    getValues(entities.teams),
    array.map(team => team.id),
    array.filter(teamId => isEqual(roomId, selectRoomByTeamId(entities, teamId)))
  )

export const selectTeamsByGameId = (entities: Immutable<Entities>, gameId: GameId): TeamId[] =>
  pipe(
    entities.teams.values(),
    it => Array.from(it),
    array.map(team => team.id),
    array.filter(teamId => isEqual(gameId, selectGameByTeamId(entities, teamId)))
  )


export const selectUsersByGameId = (entities: Immutable<Entities>, gameId: GameId): UserId[] =>
  pipe(
    selectTeamsByGameId(entities, gameId),
    array.map(teamId => selectUsersByTeamId(entities, teamId)),
    array.flatten
  )

export const selectUsersByRoomId = (entities: Immutable<Entities>, roomId: RoomId): UserId[] =>
  pipe(
    selectTeamsByRoomId(entities, roomId),
    array.map(teamId => selectUsersByTeamId(entities, teamId)),
    array.flatten
  )