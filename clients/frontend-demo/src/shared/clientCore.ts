import { BaseWsClient } from "tsrpc-base-client"
import { Req } from "./protocols/MsgClientToServer";
import { PongRes, Res, RoomDetailRes, TickRes } from "./protocols/MsgServerToClient";
import { ServiceType } from "./protocols/serviceProto";

export type ClientOpts = {
  userId: string
}

export class StockioClient {
  _wsClient: BaseWsClient<ServiceType>
  _clientOpts: ClientOpts
  _callbacks: Map<Res["kind"], Callback> = new Map()

  constructor(wsClient: BaseWsClient<ServiceType>, clientOpts: ClientOpts) {
    this._wsClient = wsClient
    this._clientOpts = clientOpts
  }

  async connect() {
    await this._wsClient.connect()
    this._wsClient.listenMsg("ServerToClient", msg => {
      const callback = this._callbacks.get(msg.kind) || ((res: Res) => console.error(`Received ${msg.kind} but on${msg.kind} is not available.`))
      callback(msg)
    })
    // send heartbeat every 10s
    //setInterval(() => this.sendReq({kind: 'PingReq'}).catch(console.error), 10000)
    return this
  }

  sendReq(req: Req) {
    return this._wsClient.sendMsg('ClientToServer', {
      ...req,
      user_id: this._clientOpts.userId,
      ts: new Date()
    })
  }

  onPongRes(f: (res: PongRes) => any) {
    this._callbacks.set("PongRes", f as Callback)
  }

  onTickRes(f: (res: TickRes) => any) {
    this._callbacks.set("TickRes", f as Callback)
  }

  onRoomDetail(f: (res: RoomDetailRes) => any) {
    this._callbacks.set("RoomDetailRes", f as Callback)
  }
}

type Callback = (res: Res) => any