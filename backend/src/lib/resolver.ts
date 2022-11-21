import { v4 as uuid } from "uuid";
import { interval, map, merge, mergeMap, Observable, Subject } from "rxjs";
import { GameClock, Price, RoomId, UserId } from "../shared/protocols/model";
import { EnterRandomRoomReq, MsgClientToServer, PingReq, Req, StartGameReq } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { flow, pipe } from "fp-ts/lib/function";
import { RoomDetailRes, TickRes } from "../shared/protocols/MsgServerToClient";
import { Entities, Game, getEntities, Room, selectActiveGames, selectGamesByUserId, selectRoomsByUserId, setEntities, User } from "./store";
import { produce, Immutable, current, original, castImmutable } from "immer";
import { match, P } from "ts-pattern";
import * as O from "fp-ts/lib/Option";

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
      draft.users.set(userId, {id: userId})
    })
  }
}

function disconnectReqFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return {
    outgoingMsg: [],
    newEntities: produce(entities, draft => {
      draft.users.delete(userId)
      selectRoomsByUserId(entities, userId)
        .map(room => room.id)
        .forEach(rid => draft.rooms.get(rid)?.userIds.delete(userId))
      
      selectGamesByUserId(entities, userId)
        .map(game => game.id)
        .forEach(gid => draft.games.get(gid)?.userIds.delete(userId))
    })
  }
}

function enterRandomRoomFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return pipe(
    entities,
    e => selectRoomsByUserId(e, userId)[0],
    O.fromNullable,
    O.match(
      () => 
        pipe(
          userId,
          uid => ({
            id: RoomId(uuid().slice(0, 5)),
            userIds: new Set<UserId>().add(uid),
            status: 'WAITING'
          } as Room),
          newRoom => ({
            outgoingMsg: roomDetailRes(newRoom),
            newEntities: produce(entities, draft => {
              draft.rooms.set(newRoom.id, newRoom as Room)
            })
          })
        ),
      room => {
        return {
          outgoingMsg: roomDetailRes(room),
          newEntities: entities
        }
      }
    )
  )
}

function leaveRoomFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput {
  return pipe(
    entities,
    e => selectRoomsByUserId(e, userId)[0],
    O.fromNullable,
    O.map(room => room.id),
    O.match(
      () => ({
        newEntities: entities,
        outgoingMsg: []
      }),
      (roomId: RoomId) => {
        const newEntity = produce(entities, draft => {
          draft.rooms.get(roomId)!.userIds.delete(userId)
        })
        return {
          newEntities: newEntity,
          outgoingMsg: roomDetailRes(newEntity.rooms.get(roomId)!)
        } as FlowOutput
      }
    )
  )
}

function roomDetailRes(room: Immutable<Room>): OutGoingMsg {
  return {
    userIds: [...room.userIds],
    msg: {
      kind: "RoomDetailRes",
      roomId: room.id,
      userIds: [...room.userIds],
      status: room.status,
      ts: new Date()
    }
  }
}

function startGameFlow(userId: UserId, entities: Immutable<Entities>): FlowOutput{
  const newGame = (fromRoom: Immutable<Room>): Game => ({
      id: RoomId(uuid().slice(0, 5)),
      userIds: new Set(fromRoom.userIds),
      price: 100,
      gameClock: 0,
      status: 'ACTIVE',
      ts: new Date()
  })

  return pipe(
    entities,
    e => selectGamesByUserId(e, userId)[0],
    O.fromNullable,
    O.match(
      () => {
        const room = produce(selectRoomsByUserId(entities, userId)[0], draft => {
          draft.status = 'GAME_STARTED'
        })
        const game: Game = newGame(room)
        return {
          newEntities: produce(entities, draft => {
            draft.rooms.set(room.id, room as Room)
            draft.games.set(game.id, game)
          }),
          outgoingMsg: [roomDetailRes(room), tickRes(game)]
        } as FlowOutput
      },
      (game) => {
        return {
          newEntities: entities,
          outgoingMsg: []
        }
      }
    )
  )
}

function tickRes(g: Game|Immutable<Game>): OutGoingMsg {
  return {
    userIds: [...g.userIds],
    msg: {
      kind: "TickRes",
      price: g.price,
      gameClock: g.gameClock,
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
    entities,
    e => selectActiveGames(e),
    games => games.map(g => computeGame(g, ts)),
    games => {
      return {
        outgoingMsg: games.map(tickRes),
        newEntities: produce(entities, draft => {
          games.forEach(g => {
            draft.games.set(g.id, g as Game)
          })
        })
      } as FlowOutput
    }
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
    .with({kind: "PingReq", userId: P.select()}, uid => pingFlow(uid, entities))
    .with({kind: "ConnectReq", userId: P.select()}, uid => connectReqFlow(uid, entities))
    .with({kind: "DisconnectReq", userId: P.select()}, uid => disconnectReqFlow(uid, entities))
    .with({kind: "EnterRandomRoomReq", userId: P.select()}, uid => enterRandomRoomFlow(uid, entities))
    .with({kind: "LeaveRoomReq", userId: P.select()}, uid => leaveRoomFlow(uid, entities))
    .with({kind: "StartGameReq", userId: P.select()}, uid => startGameFlow(uid, entities))
    .with({kind: "OrderReq", userId: P.select()}, uid => errorFlow(uid, entities, 'Not implemented'))
    .with({kind: "TimerTickReq", ts: P.select()}, (ts) => timerTickFlow(entities, ts))
    .exhaustive()
}

const timer$: Observable<TimerTickReq> = interval(1000)
  .pipe(map(value => ({kind: "TimerTickReq", count: value, ts: new Date()})))

export function resolve(req$: Observable<MsgClientToServer>) {
  return merge(req$, timer$).pipe(
    map(x => translate(x, getEntities())),
    map(output => {
      setEntities(output.newEntities)
      return output.outgoingMsg
    }),
    mergeMap(toArray))
}

type TimerTickReq = {
  kind: 'TimerTickReq'
  count: number
  ts: Date
}
