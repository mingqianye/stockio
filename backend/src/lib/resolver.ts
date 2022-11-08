import { v4 as uuid } from "uuid";
import { map, Observable } from "rxjs";
import { RoomId, UserId } from "../shared/protocols/model";
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { match, P } from "ts-pattern";

export class RequestResolver {
  _roomMap: Record<RoomId, Room> = {}
  outgoingStream: Observable<OutGoingMsg>

  constructor(reqObservable: Observable<MsgClientToServer>) {
    this.outgoingStream = reqObservable.pipe(map(this._translate))
  }

  _translate(req: MsgClientToServer): OutGoingMsg {
    return match(req)
      .with({kind: "PingReq"}, () => RequestResolver._pongRes(req.user_id))
      .with({kind: "CreateRoomReq"}, () => this._addRoom().addUser(req.user_id).roomDetailRes())
      .with({kind: "EnterRoomReq", room_id: P.select()}, (roomId) => this._roomMap[roomId].addUser(req.user_id).roomDetailRes())
      .with({kind: "JoinRandomRoomReq"}, () => Object.values(this._roomMap)[0].addUser(req.user_id).roomDetailRes())
      .with({kind: "LeaveRoomReq"}, () => RequestResolver._serverErrorRes(req.user_id, "Not implemented"))
      .with({kind: "OrderReq"}, () => RequestResolver._serverErrorRes(req.user_id, "Not implemented"))
      .exhaustive()
  }

  _addRoom(): Room {
    const room = new Room()
    this._roomMap[room.id] = room
    return room
  }

  static _pongRes(uid: UserId): OutGoingMsg { 
    return {
      user_ids: [uid],
      msg: {
        kind: "PongRes",
        ts: new Date()
      }
    }
  }

  static _serverErrorRes(uid: UserId, err: string): OutGoingMsg {
    return {
      user_ids: [uid],
      msg: {
        kind: "ServerErrorRes",
        error: err,
        ts: new Date()
      }
    }
  }
}

class Room {
  readonly id: RoomId = RoomId(uuid().slice(0, 5))
  readonly user_ids: Set<UserId> = new Set<UserId>()

  addUser(uid: UserId): Room {
    this.user_ids.add(uid)
    return this
  }

  roomDetailRes(): OutGoingMsg {
    return {
      user_ids: [...this.user_ids],
      msg: {
        kind: "RoomDetailRes",
        room_id: this.id,
        ts: new Date()
      }
    }
  }
}