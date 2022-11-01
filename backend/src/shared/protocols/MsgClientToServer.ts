import { BaseClientToServerMessage, RoomId, UserId } from "./model"

export type MsgClientToServer = Req & BaseClientToServerMessage

export type Req = 
  | CreateRoomReq 
  | JoinRandomRoomReq
  | EnterRoomReq
  | LeaveRoomReq
  | OrderReq

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
}

export type OrderReq = {
  kind: 'OrderReq'
}