import { v4 as uuid } from "uuid";
import { readonlyArray } from "fp-ts";
import { Observable, Observer } from "rxjs";
import { RoomId, UserId } from "../shared/protocols/model";
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer";
import { OutGoingMsg } from "./connection";
import { RoomDetailRes } from "../shared/protocols/MsgServerToClient";

export class RequestResolver {
  _reqObservable: Observable<MsgClientToServer>
  _outgoingMsgObserver: Observer<OutGoingMsg>
  _roomMap: Record<RoomId, Room> = {}

  constructor(reqObservable: Observable<MsgClientToServer>, outgoingMsgObserver: Observer<OutGoingMsg>) {
    this._outgoingMsgObserver = outgoingMsgObserver
    this._reqObservable = reqObservable

    this._reqObservable.subscribe(msg => {
      switch(msg.kind) {
      case "PingReq":
        outgoingMsgObserver.next({
          user_ids: [msg.user_id],
          msg: {
            kind: "PongRes",
            ts: new Date()
          }
        })
      case "CreateRoomReq":
        this._addRoom(outgoingMsgObserver).addUser(msg.user_id)
        break;
      case "EnterRoomReq":
        this._roomMap[msg.room_id].addUser(msg.user_id)
        break;
      case "JoinRandomRoomReq":
        Object.values(this._roomMap)[0].addUser(msg.user_id)
        break;
    }})
  }

  _addRoom(outgoingStream: Observer<OutGoingMsg>): Room {
    const room = new Room(outgoingStream)
    this._roomMap[room.id] = room
    return room
  }
}

class Room {
  readonly id: RoomId = RoomId(uuid().slice(0, 5))
  readonly user_ids: Set<UserId> = new Set<UserId>()
  _outgoingStream: Observer<OutGoingMsg>

  constructor(outgoingStream: Observer<OutGoingMsg>) {
    this._outgoingStream = outgoingStream
  }

  addUser(uid: UserId): Room {
    this.user_ids.add(uid)
    this._sendRoomDetailRes()
    return this
  }

  _sendRoomDetailRes(): void {
    this._outgoingStream.next({
      user_ids: [...this.user_ids],
      msg: {
        kind: "RoomDetailRes",
        room_id: this.id,
        ts: new Date()
      }
    })
  }
}