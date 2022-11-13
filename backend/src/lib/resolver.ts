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
      user_ids: new Set<UserId>().add(uid)
    }
    this._roomMap[room.id] = room
    return room
  }

  enterRoom(uid: UserId, roomId: RoomId): Room {
    this._roomMap[roomId].user_ids.add(uid)
    return this._roomMap[roomId]
  }

  enterRandomRoom(uid: UserId): Room {
    const room = Object.values(this._roomMap)[0]
    room.user_ids.add(uid)
    return room
  }

  leaveRoom(uid: UserId, roomId: RoomId): Room {
    const room = this._roomMap[roomId]
    room.user_ids.delete(uid)
    return room
  }

}

const state = new State()

type Room = {
  id: RoomId
  user_ids: Set<UserId>
}

function roomDetailRes(room: Room): OutGoingMsg {
  return {
    user_ids: [...room.user_ids],
    msg: {
      kind: "RoomDetailRes",
      room_id: room.id,
      user_ids: [...room.user_ids],
      room_is_ready: false,
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
      () => pongRes(req.user_id))
    .with({ kind: "EnterRandomRoomReq" },
      () => roomDetailRes(state.enterRandomRoom(req.user_id)))
    .with({ kind: "LeaveRoomReq", room_id: P.select() }, 
      (roomId) => roomDetailRes(state.leaveRoom(req.user_id, roomId)))
    .with({ kind: "OrderReq" }, 
      () => serverErrorRes(req.user_id, "Not implemented"))
    .exhaustive()

const pongRes = (uid: UserId): OutGoingMsg => ({
  user_ids: [uid],
  msg: {
    kind: "PongRes",
    ts: new Date()
  }})

const serverErrorRes = (uid: UserId, err: string): OutGoingMsg => ({
    user_ids: [uid],
    msg: {
      kind: "ServerErrorRes",
      error: err,
      ts: new Date()
    }})

function toArray<T>(t: T | T[]): T[] {
  const empty: T[] = []
  return empty.concat(t)
}