import { GameClock, Price, RoomId, TeamId, UserId } from "../shared/protocols/model"
import { castImmutable, Immutable } from "immer"
import { createSelector } from "reselect"
import { findAllInValues } from "./func"
import { fromNullable } from "fp-ts/lib/Option"

export type Store = {
  entities: Immutable<Entities>
}

export type Entities = {
  users: Map<UserId, User>
  rooms: Map<RoomId, Room>
  teams: Map<TeamId, Team>
  games: Map<GameId, Game>
}

export type User = {
  id: UserId
}

export type Room = {
  id: RoomId
  userIds: Set<UserId>
  status: 'WAITING' | 'GAME_STARTED'
}

export type Team = {
  id: TeamId
  userIds: Set<UserId>
}

export type Game = {
  id: GameId
  userIds: Set<UserId>
  status: 'ACTIVE' | 'COMPLETED'
  price: Price
  gameClock: GameClock
  ts: Date
}

export type GameId = string

const store: Store = {
  entities: {
    users: new Map(),
    teams: new Map(),
    rooms: new Map(),
    games: new Map()
  }
}

export const getEntities = () => store.entities
export const setEntities = (entities: Immutable<Entities>) => store.entities = entities


export const selectUsers = (entities: Immutable<Entities>) => entities.users
export const selectTeams = (entities: Immutable<Entities>) => entities.teams
export const selectRooms = (entities: Immutable<Entities>) => entities.rooms
export const selectGames = (entities: Immutable<Entities>) => entities.games

export const selectRoomsByUserId = createSelector(
  [
    selectRooms,
    (_, userId: UserId) => userId
  ],
  (roomsEntity, userId) => findAllInValues(roomsEntity, v => v.userIds.has(userId))
)

export const selectGamesByUserId = createSelector(
  [
    selectGames,
    (_, userId: UserId) => userId
  ],
  (gamesEntity, userId) => findAllInValues(gamesEntity, v => v.userIds.has(userId))
)

export const selectActiveGames = createSelector(
  selectGames,
  gameEntity => findAllInValues(gameEntity, v => v.status == 'ACTIVE')
)