import { BaseClientToServerMessage, RoomId, UserId } from "./model"

export type MsgClientToServer = Req & BaseClientToServerMessage

export type Req = 
  | PingReq
  | CreateRoomReq 
  | JoinRandomRoomReq
  | EnterRoomReq
  | LeaveRoomReq
  | OrderReq

// [START] Utility responses
export type PingReq = {
  kind: 'PingReq'
}
// [END] Utility responses

// [START] Room related requests
export type CreateRoomReq = {
  kind: 'CreateRoomReq'
}

export type JoinRandomRoomReq = {
  kind: 'JoinRandomRoomReq'
}

export type EnterRoomReq = {
  kind: 'EnterRoomReq'
  room_id: RoomId
}

export type LeaveRoomReq = {
  kind: 'LeaveRoomReq'
  room_id: RoomId
}
// [END] Room related requests

export type OrderReq = {
  kind: 'OrderReq'
}