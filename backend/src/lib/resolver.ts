import { v4 as uuid } from "uuid";
import { interval, map, merge, mergeMap, Observable, Subject, tap } from "rxjs";
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { flow, pipe } from "fp-ts/lib/function";
import { Entities, Game, GameId, getEntities, Room, RoomId, selectRoomByTeamId, selectRoomByUserId, selectTeamByUserId, selectTeamsByRoomId, selectUsersByGameId, selectUsersByRoomId, selectUsersByTeamId, setEntities, TeamId, User, UserId } from "./store";
import { produce, Immutable, current, original, castImmutable } from "immer";
import { match, P } from "ts-pattern";
import * as O from "fp-ts/lib/Option";
import {array, io as IO} from "fp-ts";
import { getOption, getValues, updateIfExists } from "./func";

function pingFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return {
    outgoingMsg: {
      userIds: [userId],
      msg: {
        kind: "PongRes",
        ts: new Date()
      }
    },
    newEntities: entities
  }
}

function connectReqFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return {
    outgoingMsg: [],
    newEntities: produce(entities, draft => {
      draft.users.set(userId, {
        id: userId,
        status: { type: 'IDLE' }
      })
    })
  }
}

function disconnectReqFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return {
    outgoingMsg: [],
    newEntities: entities
  }
}

function createRoomFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return pipe(
    IO.Do,
    IO.bind("teamId", () => IO.of(uuid().slice(0, 5) as TeamId)),
    IO.bind("roomId", () => IO.of(uuid().slice(0, 5) as RoomId)),
    IO.bind("newEntities", ({teamId, roomId}) => IO.of(produce(entities, draft => {
      draft.users.set(userId, {
        id: userId,
        status: {
          type: 'IN_TEAM',
          teamId: teamId
        }
      })
      draft.teams.set(teamId, {
        id: teamId,
        status: {
          type: 'IN_ROOM',
          roomId: roomId
        }
      })
      draft.rooms.set(roomId, {
        id: roomId,
        status: 'WAITING',
      })
    }))),
    IO.bind("outgoingMsg", ({newEntities, roomId}) => IO.of(roomDetailRes(newEntities, roomId))),
  )()
}

function enterRoomFlow(userId: UserId, roomId: RoomId, entities: Immutable<Entities>): FlowOutput {
  return pipe(
    getOption(entities.rooms, roomId),
    O.bind('teamId', () => O.of(uuid().slice(0,5) as TeamId)),
    O.bind('newEntities', ({teamId}) => O.of(produce(entities, draft => {
      updateIfExists(draft.users, userId, userDraft => {
        userDraft.status = {
          type: 'IN_TEAM',
          teamId: teamId
        }
      })
      updateIfExists(draft.teams, teamId, teamDraft => {
        teamDraft.status = {
          type: 'IN_ROOM',
          roomId: roomId
        }
      })
    }))),
    O.bind('outgoingMsg', ({newEntities}) => O.of(roomDetailRes(newEntities, roomId))),
    O.getOrElse((): FlowOutput => ({
      newEntities: entities,
      outgoingMsg: []
    }))
  )
}

function leaveRoomFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return pipe(
    O.Do,
    O.bind("roomId", () => selectRoomByUserId(entities, userId)),
    O.bind("newEntities", () => O.of(produce(entities, draft => {
      updateIfExists(draft.users, userId, user => user.status.type = 'IDLE')
    }))),
    O.map(({newEntities, roomId}) => ({
      newEntities: newEntities,
      outgoingMsg: roomDetailRes(newEntities, roomId)
    })),
    O.getOrElse((): FlowOutput => ({
      newEntities: entities,
      outgoingMsg: []
    }))
  )
}

function roomDetailRes(entities: Immutable<Entities>, roomId: RoomId): OutGoingMsg {
  return pipe(
    selectUsersByRoomId(entities, roomId),
    userIds => ({
      userIds: userIds,
      msg: {
        kind: "RoomDetailRes",
        roomId: roomId,
        teams: [{
          userIds: userIds,
        }],
        status: entities.rooms.get(roomId)!.status,
        ts: new Date()
      }
    })
  )
}

function startGameFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput{
  return pipe(
    O.Do,
    O.bind("teamId", () => selectTeamByUserId(entities, userId)),
    O.bind("roomId", ({teamId}) => selectRoomByTeamId(entities, teamId)),
    O.bind("allTeamIds", ({roomId}) => O.of(selectTeamsByRoomId(entities, roomId))),
    O.bind("gameId", () => O.of(uuid().slice(0, 5) as GameId)),
    O.bind("newEntities", ({allTeamIds, roomId, gameId}) => O.of(produce(entities, draft => {
      allTeamIds.forEach(teamId => {
        updateIfExists(draft.teams, teamId, teamDraft => {
          teamDraft.status = {
            type: 'IN_GAME',
            gameId: gameId
          }
        })
      })

      updateIfExists(draft.rooms, roomId, roomDraft => roomDraft.status = 'GAME_STARTED')

      draft.games.set(gameId, {
        id: gameId,
        status: 'ACTIVE',
        price: 100,
        gameClock: 0,
        ts: new Date()
      })
    }))),
    O.bind("outgoingMsg", ({newEntities, gameId}) => O.of(tickRes(newEntities, gameId))),
    O.getOrElse((): FlowOutput => ({
      newEntities: entities,
      outgoingMsg: []
    }))
  )
}

function tickRes(entities: Immutable<Entities>, gameId: GameId): OutGoingMsg {
  return {
    userIds: selectUsersByGameId(entities, gameId),
    msg: {
      kind: "TickRes",
      price: entities.games.get(gameId)!.price,
      gameClock: entities.games.get(gameId)!.gameClock,
      ts: new Date()
    }
  }
}

function timerTickFlow(entities: Immutable<Entities>, ts: Date): FlowOutput {
  function computeGame(game: Immutable<Game>, ts: Date): Immutable<Game> {
    return produce(game, draft => {
      draft.gameClock++
      draft.price = 100 + Math.floor(Math.random() * 50)
      draft.ts = ts
    })
  }

  return pipe(
    getValues(entities.games),
    array.filter(g => g.status == 'ACTIVE'),
    array.map(g => computeGame(g, ts)),
    games => ({
      outgoingMsg: games.map(g => tickRes(entities, g.id)),
      newEntities: produce(entities, draft => {
        games.forEach(g => {
          draft.games.set(g.id, g as Game)
        })
      })
    })
  )
}

function toArray<T>(t: T | T[]): T[] {
  const empty: T[] = []
  return empty.concat(t)
}


//////////////////////////// Entrypoint
type FlowOutput = {
  outgoingMsg: OutGoingMsg | OutGoingMsg[]
  newEntities: Immutable<Entities>
}

function errorFlow(userId: UserId, entities: Immutable<Entities>, err: string): FlowOutput {
  return {
    outgoingMsg: {
      userIds: [userId],
      msg: {
        kind: "ServerErrorRes",
        error: err,
        ts: new Date()
      }
    },
    newEntities: entities
  }
}

function translate(req: MsgClientToServer | TimerTickReq, entities: Immutable<Entities>): FlowOutput {
  return match(req)
    .with({kind: "PingReq", userId: P.select()}, uid => pingFlow(uid as UserId, entities))
    .with({kind: "ConnectReq", userId: P.select()}, uid => connectReqFlow(uid as UserId, entities))
    .with({kind: "DisconnectReq", userId: P.select()}, uid => disconnectReqFlow(uid as UserId, entities))
    .with({kind: "CreateRoomReq", userId: P.select()}, uid => createRoomFlow(uid as UserId, entities))
    .with({kind: "EnterRoomReq", userId: P.select('uid'), roomId: P.select('rid')}, ({uid, rid}) => enterRoomFlow(uid as UserId, rid as RoomId, entities))
    .with({kind: "LeaveRoomReq", userId: P.select()}, uid => leaveRoomFlow(uid as UserId, entities))
    .with({kind: "StartGameReq", userId: P.select()}, uid => startGameFlow(uid as UserId, entities))
    .with({kind: "OrderReq", userId: P.select()}, uid => errorFlow(uid as UserId, entities, 'Not implemented'))
    .with({kind: "TimerTickReq", ts: P.select()}, (ts) => timerTickFlow(entities, ts))
    .exhaustive()
}

export function resolve$(req$: Observable<MsgClientToServer>) {
  const timer$: Observable<TimerTickReq> = interval(5000)
    .pipe(map(value => ({kind: "TimerTickReq", count: value, ts: new Date()})))

  return merge(req$, timer$).pipe(
    map(x => translate(x, getEntities())),
    tap(flowOutput => setEntities(flowOutput.newEntities)),
    map(flowOutput => flowOutput.outgoingMsg),
    mergeMap(toArray))
}

type TimerTickReq = {
  kind: 'TimerTickReq'
  count: number
  ts: Date
}
