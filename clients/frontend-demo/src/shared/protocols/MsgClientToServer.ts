import { RoomId, UserId } from "./model"

export type MsgClientToServer = Req & BaseClientToServerMessage

export type Req = 
  | PingReq
  | DisconnectReq
  | EnterRandomRoomReq
  | LeaveRoomReq
  | StartGameReq
  | OrderReq

// [START] Utility responses
export type PingReq = {
  kind: 'PingReq'
}

export type DisconnectReq = {
  kind: 'DisconnectReq'
}
// [END] Utility responses

// [START] Room requests
export type EnterRandomRoomReq = {
  kind: 'EnterRandomRoomReq'
}

export type LeaveRoomReq = {
  kind: 'LeaveRoomReq'
}

export type StartGameReq = {
  kind: 'StartGameReq'
}
// [END] Room requests

export type OrderReq = {
  kind: 'OrderReq'
}

export type BaseClientToServerMessage = {
  userId: UserId
  ts: Date
}