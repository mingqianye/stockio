import { BaseServerToClientMessage, RoomId, UserId} from "./model"

export type MsgServerToClient = (
| PongRes
| RoomDetailRes
| ServerErrorRes
| TickRes)
& BaseServerToClientMessage

// [START] Utility responses
export type PongRes = {
  kind: 'PongRes'
}
// [END] Utility responses

// [START] Room related responses
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