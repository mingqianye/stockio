import { RoomId, UserId} from "./model"

export type MsgServerToClient = Res & BaseServerToClientMessage

export type Res = 
| PongRes
| RoomDetailRes
| ServerErrorRes
| TickRes

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
  roomId: RoomId
  userIds: UserId[]
  roomIsReady: boolean
}
// [END] Room response

export type TickRes = {
  kind: 'TickRes'
}

export type BaseServerToClientMessage = {
  ts: Date
}