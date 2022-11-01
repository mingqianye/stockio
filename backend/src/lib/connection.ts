import { pipe } from "fp-ts/lib/function"
import path from "path"
import { WsConnection, WsServer } from "tsrpc"
import { UserId } from "../shared/protocols/model"
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer"
import { MsgServerToClient } from "../shared/protocols/MsgServerToClient"
import { serviceProto, ServiceType } from "../shared/protocols/serviceProto"

export class ConnectionManager {
  _connectionMap: ConnectionMap = {};
  _wsServer: WsServer<ServiceType> = new WsServer<ServiceType>(serviceProto, { port: 3000 });

  constructor(msgListener: MsgListener) {
    this._wsServer.listenMsg("ClientToServer", (call) => {
      this._connectionMap[call.msg.user_id] = call.conn as WsConnection
      msgListener(call.msg)
    })
    this._wsServer.start().catch(x => console.error(`Unable to start ConnectionManager ${x}`))
  }

  async broadcast(outGoingMsg: OutGoingMsg) {
    await this._wsServer.broadcastMsg("ServerToClient", outGoingMsg.msg, outGoingMsg.user_ids.map(id => this._connectionMap[id]))
  }
}

export type OutGoingMsg = {
  user_ids: ReadonlyArray<UserId>
  msg: MsgServerToClient
}

export type MsgListener = (msg: MsgClientToServer) => unknown

type ConnectionMap = {
  [key: UserId]: WsConnection
}