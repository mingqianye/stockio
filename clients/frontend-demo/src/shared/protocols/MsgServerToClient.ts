import { BaseServerToClientMessage, RoomId, UserId} from "./model"

export type MsgServerToClient = (
| PongRes
| ServerErrorRes
| TickRes
| RoomDetailRes)
& BaseServerToClientMessage

export type PongRes = {
  kind: 'PongRes'
}

// [START] Room related response
export type RoomDetailRes = {
  kind: 'RoomDetailRes'
  room_id: RoomId
  users: UserId[]
}
// [END] Room related response

export type TickRes = {
  kind: 'TickRes'
}

export type ServerErrorRes = {
  kind: 'ServerErrorRes'
  error: string
}