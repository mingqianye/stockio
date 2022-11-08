import { v4 as uuid } from "uuid";
import { map, Observable } from "rxjs";
import { RoomId, UserId } from "../shared/protocols/model";
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { match, P } from "ts-pattern";

const roomMap: Record<RoomId, Room> = {}

export const resolve = (reqObservable: Observable<MsgClientToServer>) => 
  reqObservable.pipe(map(translate))

const translate = (req: MsgClientToServer) =>
  match(req)
    .with({kind: "PingReq"}, () => pongRes(req.user_id))
    .with({kind: "CreateRoomReq"}, () => addRoom().addUser(req.user_id).roomDetailRes())
    .with({kind: "EnterRoomReq", room_id: P.select()}, (roomId) => roomMap[roomId].addUser(req.user_id).roomDetailRes())
    .with({kind: "JoinRandomRoomReq"}, () => Object.values(roomMap)[0].addUser(req.user_id).roomDetailRes())
    .with({kind: "LeaveRoomReq"}, () => serverErrorRes(req.user_id, "Not implemented"))
    .with({kind: "OrderReq"}, () => serverErrorRes(req.user_id, "Not implemented"))
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

const addRoom = () => {
  const room = new Room()
  roomMap[room.id] = room
  return room
}

class Room {
  readonly id: RoomId = RoomId(uuid().slice(0, 5))
  readonly _user_ids: Set<UserId> = new Set<UserId>()

  addUser(uid: UserId): Room {
    this._user_ids.add(uid)
    return this
  }

  roomDetailRes(): OutGoingMsg {
    return {
      user_ids: [...this._user_ids],
      msg: {
        kind: "RoomDetailRes",
        room_id: this.id,
        ts: new Date()
      }
    }
  }
}