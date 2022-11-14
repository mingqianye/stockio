import { v4 as uuid } from "uuid";
import { map, mergeMap, Observable } from "rxjs";
import { RoomId, UserId } from "../shared/protocols/model";
import { EnterRandomRoomReq, MsgClientToServer, Req } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { flow } from "fp-ts/lib/function";

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
    roomMap: Record<RoomId, Room>
  }

  type Room = {
    id: RoomId
    userIds: Set<UserId>
  }

  const state: State = {
    roomMap: {}
  }

  export const EnterRandomRoomFlow: Flow = flow(
    extractUid,
    createRoom,
    upsertRoom,
    roomDetailRes
  )

  export const LeaveRoomFlow: Flow = flow(
    extractUid,
    removeUser,
    (rooms) => rooms.map(roomDetailRes)
  )

  function createRoom(userId: UserId): Room {
    return {
      id: RoomId(uuid().slice(0, 5)),
      userIds: new Set<UserId>().add(userId)
    }
  }

  function removeUser(userId: UserId) {
    return Object.values(state.roomMap)
      .map(room => {
        room.userIds.delete(userId)
        return room
      })
      .filter(room => room.userIds.size == 0)
      .map(deleteRoom)
  }

  function deleteRoom(r: Room): Room {
    delete state.roomMap[r.id]
    return r
  }

  function upsertRoom(r: Room): Room {
    state.roomMap[r.id] = r
    return r
  }

  function roomDetailRes(room: Room): OutGoingMsg {
    return {
      userIds: [...room.userIds],
      msg: {
        kind: "RoomDetailRes",
        roomId: room.id,
        userIds: [...room.userIds],
        roomIsReady: false,
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

const errorFlow = (err: string) => (req: MsgClientToServer) => serverErrorRes(req.userId, err)

const translate: Flow = (msg: MsgClientToServer) => 
  (flowMap.get(msg.kind) || errorFlow(`Handler not Implemented for ${msg.kind}`))(msg)

export const resolve = (reqObservable: Observable<MsgClientToServer>) =>
  reqObservable.pipe(
    map(translate),
    mergeMap(toArray)
  )
