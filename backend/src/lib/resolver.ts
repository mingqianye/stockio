import { v4 as uuid } from "uuid";
import { interval, map, merge, mergeMap, Observable, Subject } from "rxjs";
import { GameClock, Price, RoomId, UserId } from "../shared/protocols/model";
import { EnterRandomRoomReq, MsgClientToServer, Req, StartGameReq } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { flow } from "fp-ts/lib/function";
import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { match } from "fp-ts/lib/EitherT";
import { RoomDetailRes, TickRes } from "../shared/protocols/MsgServerToClient";

namespace Ping {
  export const theFlow: Flow = flow(
    extractUid,
    pongRes
  )

  function pongRes(uid: UserId): OutGoingMsg {
    return {
      userIds: [uid],
      msg: {
        kind: "PongRes",
        ts: new Date()
      }
    }
  }
}

//////////////////////// Flows
namespace Room {
  type State = {
    roomMap: Map<UserId, Room>
  }

  type Room = {
    id: RoomId
    userIds: Set<UserId>
  }

  const state: State = {
    roomMap: new Map<UserId, Room>()
  }

  export const EnterRandomRoomFlow: Flow = flow(
    extractUid,
    findOrCreateRoom,
    roomDetailRes
  )

  export const LeaveRoomFlow: Flow = flow(
    extractUid,
    removeUser,
    roomDetailRes
  )

  export const StartGameFlow: Flow = flow(
    extractUid,
    findOrCreateRoom,
    startGame
  )

  function createRoom(userId: UserId): Room{
    return {
        id: RoomId(uuid().slice(0, 5)),
        userIds: new Set<UserId>().add(userId),
    }
  }

  function findOrCreateRoom(userId: UserId): Room {
    const room = state.roomMap.get(userId) || createRoom(userId)
    state.roomMap.set(userId, room)
    return room
  }

  function removeUser(userId: UserId): Room {
    const room = findOrCreateRoom(userId)
    room.userIds.delete(userId)
    state.roomMap.delete(userId)
    return room
  }

  function startGame(room: Room): OutGoingMsg {
    Game.startGame([...room.userIds])
    return roomDetailRes(room, 'GAME_STARTED')
  }

  function roomDetailRes(room: Room, status: RoomDetailRes['status'] = 'WAITING'): OutGoingMsg {
    return {
      userIds: [...room.userIds],
      msg: {
        kind: "RoomDetailRes",
        roomId: room.id,
        userIds: [...room.userIds],
        status: status,
        ts: new Date()
      }
    }
  }
}

namespace Game {
  const outGoingMsgSubject = new Subject<OutGoingMsg>()
  export const outGoingMsgStream = outGoingMsgSubject.asObservable();

  const state: State = {
    gameMap: new Map<UserId, Game>()
  }

  type State = {
    gameMap: Map<UserId, Game>
  }

  type Game = {
    userIds: Set<UserId>
    price: Price
    gameClock: GameClock
  }

  const leaveGameFlow = flow(
    extractUid,
    removeUser,
    _ => [] as OutGoingMsg[]
  )

  function removeUser(userId: UserId): Game {
    const g = findOrCreateGame(userId)
    g.userIds.delete(userId)
    state.gameMap.delete(userId)
    return g
  }


  function findOrCreateGame(userId: UserId): Game {
    const game = state.gameMap.get(userId) || createGame([userId])
    state.gameMap.set(userId, game)
    return game
  }

  function createGame(userIds: UserId[]): Game {
    return {
      userIds: new Set<UserId>(userIds),
      price: 0,
      gameClock: 0
    }
  }

  export function startGame(userIds: UserId[]): void {
    const game = upsertGame(userIds)
    interval(1000)
      .pipe(map(_ => tickRes(next(game))))
      .subscribe(msg => outGoingMsgSubject.next(msg))
  }

  function upsertGame(userIds: UserId[]): Game {
    const game: Game = {
      userIds: new Set<UserId>(userIds),
      price: 0,
      gameClock: 0
    }
    userIds.forEach(uid => state.gameMap.set(uid, game))
    return game
  }



  export function next(g: Game): Game {
    g.gameClock = g.gameClock + 1
    g.price = 100 + Math.floor(Math.random() * 50)
    return g
  }

  export function tickRes(g: Game): OutGoingMsg {
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
}

function extractUid(req: MsgClientToServer): UserId {
  return req.userId
}

function serverErrorRes(uid: UserId, err: string): OutGoingMsg {
  return {
    userIds: [uid],
    msg: {
      kind: "ServerErrorRes",
      error: err,
      ts: new Date()
    }}
}

function toArray<T>(t: T | T[]): T[] {
  const empty: T[] = []
  return empty.concat(t)
}


//////////////////////////// Entrypoint
type Flow = (req: MsgClientToServer) => OutGoingMsg | OutGoingMsg[]

const flowMap = new Map<MsgClientToServer["kind"], Flow>()
  .set("PingReq", Ping.theFlow)
  .set("EnterRandomRoomReq", Room.EnterRandomRoomFlow)
  .set("LeaveRoomReq", Room.LeaveRoomFlow)
  .set("DisconnectReq", Room.LeaveRoomFlow)
  .set("StartGameReq", Room.StartGameFlow)

const errorFlow = (err: string) => (req: MsgClientToServer) => serverErrorRes(req.userId, err)

const translate: Flow = (msg: MsgClientToServer) => 
  (flowMap.get(msg.kind) || errorFlow(`Handler not Implemented for ${msg.kind}`))(msg)

export function resolve(reqObservable: Observable<MsgClientToServer>) {
  const nonGameObservable = reqObservable.pipe(
      map(translate),
      mergeMap(toArray))
  return merge(nonGameObservable, Game.outGoingMsgStream)
}
