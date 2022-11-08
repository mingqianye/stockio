import { BaseServerToClientMessage, RoomId} from "./model"

export type MsgServerToClient = (
| PongRes
| ServerErrorRes
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

export type ServerErrorRes = {
  kind: 'ServerErrorRes'
  error: string
}