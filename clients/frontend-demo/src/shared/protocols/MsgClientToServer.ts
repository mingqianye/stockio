import { RoomId, UserId } from "./model"

export type MsgClientToServer = Req & BaseClientToServerMessage

export type Req = 
  | PingReq
  | CreateRoomReq 
  | EnterRandomRoomReq
  | EnterRoomReq
  | LeaveRoomReq
  | OrderReq

// [START] Utility responses
export type PingReq = {
  kind: 'PingReq'
}
// [END] Utility responses

// [START] Room requests
export type CreateRoomReq = {
  kind: 'CreateRoomReq'
}

export type EnterRandomRoomReq = {
  kind: 'EnterRandomRoomReq'
}

export type EnterRoomReq = {
  kind: 'EnterRoomReq'
  room_id: RoomId
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
  user_id: UserId
  ts: Date
}