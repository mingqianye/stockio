import * as path from "path";
import { Subject } from "rxjs";
import { MsgCall, WsServer } from "tsrpc";
import { ConnectionManager, OutGoingMsg } from "./lib/connection";
import { MsgClientToServer } from "./shared/protocols/MsgClientToServer";
import { serviceProto } from './shared/protocols/serviceProto';
import { RoomManager} from "./lib/room"


const clientToServerSubject = new Subject<MsgClientToServer>()
const outgoingSubject = new Subject<OutGoingMsg>()
const connectionManager = new ConnectionManager(clientToServerSubject, outgoingSubject)
const roomManager = new RoomManager(clientToServerSubject, outgoingSubject)

connectionManager.start()