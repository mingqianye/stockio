import { v4 as uuid } from "uuid";
import { interval, map, merge, mergeMap, Observable, Subject, tap } from "rxjs";
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { flow, pipe } from "fp-ts/lib/function";
import { Entities, Game, GameId, getEntities, Room, RoomId, selectRoomByTeamId, selectRoomByUserId, selectTeamByUserId, selectTeamsByRoomId, selectUsersByGameId, selectUsersByRoomId, selectUsersByTeamId, setEntities, Team, TeamId, User, UserId } from "./store";
import { match, P } from "ts-pattern";
import * as O from "fp-ts/lib/Option";
import {array, io as IO} from "fp-ts";
import { updateFn, updateRecords } from "./func";
import update from 'immutability-helper';
import * as I from "fp-ts/lib/Identity";

function pingFlow(userId: UserId, entities: Entities): FlowOutput {
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

function connectReqFlow(userId: UserId, entities: Entities): FlowOutput {
  return {
    outgoingMsg: [],
    newEntities: update(entities, { users: {
      [userId]: {$set: { id: userId, status: {type: 'IDLE'} }}}}),
  }
}

function disconnectReqFlow(userId: UserId, entities: Entities): FlowOutput {
  return {
    outgoingMsg: [],
    newEntities: entities
  }
}

function createRoomFlow(userId: UserId, entities: Entities): FlowOutput {
  return pipe(
    IO.Do,
    IO.bind("teamId", () => IO.of(uuid().slice(0, 5) as TeamId)),
    IO.bind("roomId", () => IO.of(uuid().slice(0, 5) as RoomId)),
    IO.bind("newEntities", ({teamId, roomId}) => IO.of(update(entities, {
      users: { [userId]: { status: { $set: {type: 'IN_TEAM', teamId: teamId}}}},
      teams: { [teamId]: { $set: { id: teamId, status: { type: 'IN_ROOM', roomId: roomId }}}},
      rooms: { [roomId]: { $set: { id: roomId, status: 'WAITING'}}},
    }))),
    IO.bind("outgoingMsg", ({newEntities, roomId}) => IO.of(roomDetailRes(newEntities, roomId))),
  )()
}

function enterRoomFlow(userId: UserId, roomId: RoomId, entities: Entities): FlowOutput {
  return pipe(
    IO.Do,
    IO.bind('teamId', () => IO.of(uuid().slice(0,5) as TeamId)),
    IO.bind('newEntities', ({teamId}) => IO.of(update(entities, {
      users: { [userId]: { status: { $set: {type: 'IN_TEAM', teamId: teamId}}}},
      teams: { $merge: { [teamId]: { id: teamId, status: { type: 'IN_ROOM', roomId: roomId }}}},
    }))),
    IO.bind('outgoingMsg', ({newEntities}) => IO.of(roomDetailRes(newEntities, roomId)))
  )()
}

function leaveRoomFlow(userId: UserId, entities: Entities): FlowOutput {
  return pipe(
    O.Do,
    O.bind("roomId", () => selectRoomByUserId(entities, userId)),
    O.bind("newEntities", () => O.of(update(entities, {
      users: { [userId]: { status: { $set: {type: 'IDLE' }}}},
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

function roomDetailRes(entities: Entities, roomId: RoomId): OutGoingMsg {
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
        status: entities.rooms[roomId].status,
        ts: new Date()
      }
    })
  )
}

function startGameFlow(userId: UserId, entities: Entities): FlowOutput{
  return pipe(
    O.Do,
    O.bind("teamId", () => selectTeamByUserId(entities, userId)),
    O.bind("roomId", ({teamId}) => selectRoomByTeamId(entities, teamId)),
    O.bind("allTeamIds", ({roomId}) => O.of(selectTeamsByRoomId(entities, roomId))),
    O.bind("gameId", () => O.of(uuid().slice(0, 5) as GameId)),
    O.bind("updatedTeams", ({allTeamIds, gameId}) => O.of(
      updateRecords(entities.teams, allTeamIds, (team: Team): Team => ({
        id: team.id,
        status: {type: "IN_GAME", gameId: gameId}
      })))),
    O.bind("newEntities", ({updatedTeams, roomId, gameId}) => O.of(pipe(
      entities,
      updateFn({
        teams: {$merge: updatedTeams},
        rooms: {[roomId]: {status: {$set: 'GAME_STARTED'}}},
        games: {[gameId]: {$set: {
          id: gameId,
          status: 'ACTIVE',
          price: 100,
          gameClock: 0,
          ts: new Date()
        }}}
      }),
    ))),
    O.bind("outgoingMsg", ({newEntities, gameId}) => O.of(tickRes(newEntities, gameId))),
    O.getOrElse((): FlowOutput => ({
      newEntities: entities,
      outgoingMsg: []
    }))
  )
}

function tickRes(entities: Entities, gameId: GameId): OutGoingMsg {
  return {
    userIds: selectUsersByGameId(entities, gameId),
    msg: {
      kind: "TickRes",
      price: entities.games[gameId].price,
      gameClock: entities.games[gameId].gameClock,
      ts: new Date()
    }
  }
}

function timerTickFlow(entities: Entities, ts: Date): FlowOutput {
  return pipe(
    I.Do,
    I.bind("gameIds", () => I.of(pipe(
      Object.values(entities.games),
      array.filter(g => g.status === 'ACTIVE'),
      array.map(g => g.id)
    ))),
    I.bind("newEntities", ({gameIds}) => I.of(
      update(entities, {
        games: {$merge: updateRecords(entities.games, gameIds, (g: Game): Game => {
          return {
            id: g.id,
            status: g.status,
            gameClock: g.gameClock + 1,
            price: 100 + Math.floor(Math.random() * 50),
            ts: ts
          }
        })}
      })
    )),
    I.bind("outgoingMsg", ({newEntities, gameIds}) => I.of(
      gameIds.map(gid => tickRes(newEntities, gid))
    ))
  )
}

function toArray<T>(t: T | T[]): T[] {
  const empty: T[] = []
  return empty.concat(t)
}


//////////////////////////// Entrypoint
type FlowOutput = {
  outgoingMsg: OutGoingMsg | OutGoingMsg[]
  newEntities: Entities
}

function errorFlow(userId: UserId, entities: Entities, err: string): FlowOutput {
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

function translate(req: MsgClientToServer | TimerTickReq, entities: Entities): FlowOutput {
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
