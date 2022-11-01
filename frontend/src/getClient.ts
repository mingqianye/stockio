import { WsClient } from "tsrpc-browser";
import { UserId } from "./shared/protocols/model";
import { CreateRoomReq, JoinRandomRoomReq, Req } from "./shared/protocols/MsgClientToServer";
import { TickRes, RoomDetailRes } from "./shared/protocols/MsgServerToClient";
import { serviceProto, ServiceType } from "./shared/protocols/serviceProto";

export type ClientOpts = {
  userId: string
  onTickRes: (tickRes: TickRes) => unknown
  onRoomDetailRes: (roomDetailRes: RoomDetailRes) => unknown
}

export class StockioClient {
  _wsClient: WsClient<ServiceType> = new WsClient(serviceProto, {
      server: "ws://127.0.0.1:3000",
      logger: console,
  })

  _userId: UserId

  constructor(clientOpts: ClientOpts) {
    this._userId = UserId(clientOpts.userId)
    this._wsClient.listenMsg("ServerToClient", msg => {
      switch(msg.kind){
      case "TickRes":
        clientOpts.onTickRes(msg as TickRes)
        break;
      case "RoomDetailRes":
        clientOpts.onRoomDetailRes(msg as RoomDetailRes)
        break;
      default:
        throw new Error(`Unhandled ServerToClient message type: ${msg}`)
      }
    })
  }

  sendReq(req: Req) {
    return this._wsClient.sendMsg('ClientToServer', {
      ...req,
      user_id: this._userId,
      ts: new Date()
    })
  }
}

export const mockClient = () => new StockioClient({
  userId: "abc",
  onRoomDetailRes: (req) => console.log(req),
  onTickRes: (req) => console.log(req)
})