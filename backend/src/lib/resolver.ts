import { v4 as uuid } from "uuid";
import { map, mergeMap, Observable } from "rxjs";
import { RoomId, UserId } from "../shared/protocols/model";
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { match, P } from "ts-pattern";

class State {
  _roomMap: Record<RoomId, Room> = {}

  createRoom(uid: UserId): Room {
    const room = {
      id: RoomId(uuid().slice(0, 5)),
      userIds: new Set<UserId>().add(uid)
    }
    this._roomMap[room.id] = room
    return room
  }

  enterRoom(uid: UserId, roomId: RoomId): Room {
    this._roomMap[roomId].userIds.add(uid)
    return this._roomMap[roomId]
  }

  enterRandomRoom(uid: UserId): Room {
    const room = Object.values(this._roomMap)[0]
    room.userIds.add(uid)
    return room
  }

  leaveRoom(uid: UserId, roomId: RoomId): Room {
    const room = this._roomMap[roomId]
    room.userIds.delete(uid)
    return room
  }

}

const state = new State()

type Room = {
  id: RoomId
  userIds: Set<UserId>
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

export const resolve = (reqObservable: Observable<MsgClientToServer>) =>
  reqObservable.pipe(
    map(translate),
    mergeMap(x => toArray<OutGoingMsg>(x)),
  )

const translate = (req: MsgClientToServer) =>
  match(req)
    .with({ kind: "PingReq" },
      () => pongRes(req.userId))
    .with({ kind: "EnterRandomRoomReq" },
      () => roomDetailRes(state.enterRandomRoom(req.userId)))
    .with({ kind: "LeaveRoomReq", room_id: P.select() }, 
      (roomId) => roomDetailRes(state.leaveRoom(req.userId, roomId)))
    .with({ kind: "OrderReq" }, 
      () => serverErrorRes(req.userId, "Not implemented"))
    .exhaustive()

const pongRes = (uid: UserId): OutGoingMsg => ({
  userIds: [uid],
  msg: {
    kind: "PongRes",
    ts: new Date()
  }})

const serverErrorRes = (uid: UserId, err: string): OutGoingMsg => ({
    userIds: [uid],
    msg: {
      kind: "ServerErrorRes",
      error: err,
      ts: new Date()
    }})

function toArray<T>(t: T | T[]): T[] {
  const empty: T[] = []
  return empty.concat(t)
}