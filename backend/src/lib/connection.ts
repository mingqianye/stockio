import { pipe } from "fp-ts/lib/function"
import path from "path"
import { Observable, Observer } from "rxjs"
import { WsConnection, WsServer } from "tsrpc"
import { UserId } from "../shared/protocols/model"
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer"
import { MsgServerToClient } from "../shared/protocols/MsgServerToClient"
import { serviceProto, ServiceType } from "../shared/protocols/serviceProto"

export class ConnectionManager {
  _connectionMap: ConnectionMap = {};
  _wsServer: WsServer<ServiceType> = new WsServer<ServiceType>(serviceProto, { port: 3000 });
  _reqObserver: Observer<MsgClientToServer>
  _resObservable: Observable<OutGoingMsg>

  private constructor(reqObserver: Observer<MsgClientToServer>, resObservable: Observable<OutGoingMsg>) {
    this._reqObserver = reqObserver
    this._resObservable = resObservable
  }

  static async createAndStart(reqObserver: Observer<MsgClientToServer>, resObservable: Observable<OutGoingMsg>) {
    const cm = new ConnectionManager(reqObserver, resObservable)
    return await cm.connect()
  }

  async connect() {
    await this._wsServer.start()
    this._wsServer.listenMsg("ClientToServer", (call) => {
      this._connectionMap[call.msg.user_id] = call.conn as WsConnection
      this._reqObserver.next(call.msg)
    })
    this._resObservable.subscribe(value => this.broadcast(value))
  }

  broadcast(outGoingMsg: OutGoingMsg): void {
    this._wsServer.broadcastMsg("ServerToClient", outGoingMsg.msg, outGoingMsg.user_ids.map(id => this._connectionMap[id]))
      .then(x => {
        if (x.isSucc) return;
        console.error(x.errMsg)
      })
      .catch(ex => console.error(ex))
  }
}

export type OutGoingMsg = {
  user_ids: UserId[]
  msg: MsgServerToClient
}

export type MsgListener = (msg: MsgClientToServer) => unknown

type ConnectionMap = {
  [key: UserId]: WsConnection
}