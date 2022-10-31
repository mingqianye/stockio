import { BaseServerToClientMessage, RoomId} from "./model"

export type MsgServerToClient = (
| TickRes
| RoomDetailRes)
& BaseServerToClientMessage

export type TickRes = {
  kind: 'TickRes'
}

export type RoomDetailRes = {
  kind: 'RoomDetailRes'
  room_id: RoomId
}