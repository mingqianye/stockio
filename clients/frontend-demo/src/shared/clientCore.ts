import { BaseWsClient } from "tsrpc-base-client"
import { Req } from "./protocols/MsgClientToServer";
import { PongRes, RoomDetailRes, TickRes } from "./protocols/MsgServerToClient";
import { ServiceType } from "./protocols/serviceProto";

export type ClientOpts = {
  userId: string
  onPongRes: (pongRes: PongRes) => any
  onTickRes: (tickRes: TickRes) => any
  onRoomDetailRes: (roomDetailRes: RoomDetailRes) => any
}

export class StockioClient {
  _wsClient: BaseWsClient<ServiceType>
  _clientOpts: ClientOpts

  constructor(wsClient: BaseWsClient<ServiceType>, clientOpts: ClientOpts) {
    this._wsClient = wsClient
    this._clientOpts = clientOpts
  }

  async connect() {
    await this._wsClient.connect()
    this._wsClient.listenMsg("ServerToClient", msg => {
      switch(msg.kind){
      case "PongRes":
        this._clientOpts.onPongRes(msg as PongRes)
        break;
      case "TickRes":
        this._clientOpts.onTickRes(msg as TickRes)
        break;
      case "RoomDetailRes":
        this._clientOpts.onRoomDetailRes(msg as RoomDetailRes)
        break;
      default:
        throw new Error(`Unhandled ServerToClient message type: ${JSON.stringify(msg)}`)
      }
    })
    return this
  }

  sendReq(req: Req) {
    return this._wsClient.sendMsg('ClientToServer', {
      ...req,
      user_id: this._clientOpts.userId,
      ts: new Date()
    })
  }
}