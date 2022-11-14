import { Subject, Observable, Observer } from "rxjs"
import { WsConnection, WsServer } from "tsrpc"
import { UserId } from "../shared/protocols/model"
import { MsgClientToServer } from "../shared/protocols/MsgClientToServer"
import { MsgServerToClient } from "../shared/protocols/MsgServerToClient"
import { serviceProto, ServiceType } from "../shared/protocols/serviceProto"

const wsServer = new WsServer<ServiceType>(serviceProto, { port: 3000 });

const reqSubject = new Subject<MsgClientToServer>()

const connectionMap: Record<UserId, WsConnection> = {}

export const start = async (outgoingStream: Observable<OutGoingMsg>) => {
  await wsServer.start()
  wsServer.listenMsg("ClientToServer", (call) => {
    connectionMap[call.msg.userId] = call.conn as WsConnection
    reqSubject.next(call.msg)
  })
  outgoingStream.subscribe(outgoingMsg => {
    wsServer.broadcastMsg("ServerToClient", outgoingMsg.msg, outgoingMsg.userIds.map(id => connectionMap[id]))
      .then(x => {
        if (x.isSucc) return;
        console.error(x.errMsg)
      })
      .catch(ex => console.error(ex))
  })
}

export const reqObservable = reqSubject.asObservable()

export type OutGoingMsg = {
  userIds: UserId[]
  msg: MsgServerToClient
}