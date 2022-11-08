import { pipe } from "fp-ts/lib/function"
import path from "path"
import { Subject, Observable, Observer } from "rxjs"
import { WsConnection, WsServer } from "tsrpc"
import { UserId } from "../shared/protocols/model"
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer"
import { MsgServerToClient } from "../shared/protocols/MsgServerToClient"
import { serviceProto, ServiceType } from "../shared/protocols/serviceProto"

const wsServer = new WsServer<ServiceType>(serviceProto, { port: 3000 });

const reqSubject = new Subject<MsgClientToServer>()

const connectionMap: ConnectionMap = {}

export const start = async (outgoingStream: Observable<OutGoingMsg>) => {
  await wsServer.start()
  wsServer.listenMsg("ClientToServer", (call) => {
    connectionMap[call.msg.user_id] = call.conn as WsConnection
    reqSubject.next(call.msg)
  })
  outgoingStream.subscribe(outgoingMsg => {
    wsServer.broadcastMsg("ServerToClient", outgoingMsg.msg, outgoingMsg.user_ids.map(id => connectionMap[id]))
      .then(x => {
        if (x.isSucc) return;
        console.error(x.errMsg)
      })
      .catch(ex => console.error(ex))
  })
}

export const reqObservable = reqSubject.asObservable()

export type OutGoingMsg = {
  user_ids: UserId[]
  msg: MsgServerToClient
}

type ConnectionMap = {
  [key: UserId]: WsConnection
}