import { RoomId, UserId} from "./model"

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

export type ServerErrorRes = {
  kind: 'ServerErrorRes'
  error: string
}
// [END] Utility responses

// [START] Room responses
export type RoomDetailRes = {
  kind: 'RoomDetailRes'
  room_id: RoomId
  user_ids: UserId[]
}
// [END] Room response

export type TickRes = {
  kind: 'TickRes'
}

export type BaseServerToClientMessage = {
  ts: Date
}