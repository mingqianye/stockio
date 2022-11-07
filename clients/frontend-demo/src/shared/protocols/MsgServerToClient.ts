import { BaseServerToClientMessage, RoomId} from "./model"

export type MsgServerToClient = (
| PongRes
| TickRes
| RoomDetailRes)
& BaseServerToClientMessage

export type PongRes = {
  kind: 'PongRes'
}

export type TickRes = {
  kind: 'TickRes'
}

export type RoomDetailRes = {
  kind: 'RoomDetailRes'
  room_id: RoomId
}