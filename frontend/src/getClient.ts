import { WsClient as BrowserWsClient } from "tsrpc-browser";
import { WsClient as MiniappWsClient } from "tsrpc-miniapp";

import { Req } from "./shared/protocols/MsgClientToServer";
import { PongRes, RoomDetailRes, TickRes } from "./shared/protocols/MsgServerToClient";
import { UserId } from "./shared/protocols/model";
import { serviceProto } from "./shared/protocols/serviceProto";

export type ClientOpts = {
  userId: string
  onPongRes: (pongRes: PongRes) => unknown
  onTickRes: (tickRes: TickRes) => unknown
  onRoomDetailRes: (roomDetailRes: RoomDetailRes) => unknown
}

export class StockioClient {
  _wsClient = "__wxjs_environment" in window ?  // is mini app?
    new MiniappWsClient(serviceProto, {
      server: "ws://127.0.0.1:3000",
      logger: console,
    }) : new BrowserWsClient(serviceProto, {
      server: "ws://127.0.0.1:3000",
      logger: console,
    })

  _userId: UserId

  private constructor(userId: UserId) {
    this._userId = userId
  }

  static async create(clientOpts: ClientOpts) {
    const client = new StockioClient(clientOpts.userId)
    await client._wsClient.connect()
    client._wsClient.listenMsg("ServerToClient", msg => {
      switch(msg.kind){
      case "PongRes":
        clientOpts.onPongRes(msg as PongRes)
        break;
      case "TickRes":
        clientOpts.onTickRes(msg as TickRes)
        break;
      case "RoomDetailRes":
        clientOpts.onRoomDetailRes(msg as RoomDetailRes)
        break;
      default:
        throw new Error(`Unhandled ServerToClient message type: ${JSON.stringify(msg)}`)
      }
    })
    return client
  }

  sendReq(req: Req) {
    return this._wsClient.sendMsg('ClientToServer', {
      ...req,
      user_id: this._userId,
      ts: new Date()
    })
  }
}

export const mockClient = () => StockioClient.create({
  userId: "abc",
  onPongRes: (req) => console.log("handling" + JSON.stringify(req)),
  onRoomDetailRes: (req) => console.log(req),
  onTickRes: (req) => console.log(req)
})