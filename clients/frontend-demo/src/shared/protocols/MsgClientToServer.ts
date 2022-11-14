import { RoomId, UserId } from "./model"

export type MsgClientToServer = Req & BaseClientToServerMessage

export type Req = 
  | PingReq
  | EnterRandomRoomReq
  | LeaveRoomReq
  | OrderReq

// [START] Utility responses
export type PingReq = {
  kind: 'PingReq'
}
// [END] Utility responses

// [START] Room requests
export type EnterRandomRoomReq = {
  kind: 'EnterRandomRoomReq'
}

export type LeaveRoomReq = {
  kind: 'LeaveRoomReq'
  room_id: RoomId
}
// [END] Room requests

export type OrderReq = {
  kind: 'OrderReq'
}

export type BaseClientToServerMessage = {
  userId: UserId
  ts: Date
}