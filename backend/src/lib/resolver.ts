import { v4 as uuid } from "uuid";
import { map, mergeMap, Observable } from "rxjs";
import { Price, RoomId, UserId } from "../shared/protocols/model";
import { EnterRandomRoomReq, MsgClientToServer, Req, StartGameReq } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { flow } from "fp-ts/lib/function";
import { option } from "fp-ts";
import { Option } from "fp-ts/lib/Option";
import { match } from "fp-ts/lib/EitherT";
import { RoomDetailRes } from "../shared/protocols/MsgServerToClient";

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
    mockGameStarted
  )

  function createRoom(userId: UserId): Room{
    return {
        id: RoomId(uuid().slice(0, 5)),
        userIds: new Set<UserId>().add(userId)
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

  function mockGameStarted(room: Room): OutGoingMsg[] {
    return [
      roomDetailRes(room, 'GAME_STARTED'),
      {
        userIds: [...room.userIds],
        msg: {
          kind: 'TickRes',
          marketPrice: Price(100),
          gameClock: 0,
          ts: new Date()
        }
      },
      {
        userIds: [...room.userIds],
        msg: {
          kind: 'TickRes',
          marketPrice: Price(150),
          gameClock: 1,
          ts: new Date()
        }
      }
    ]
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

export const resolve = (reqObservable: Observable<MsgClientToServer>) =>
  reqObservable.pipe(
    map(translate),
    mergeMap(toArray)
  )
