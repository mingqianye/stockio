import * as path from "path";
import { Subject } from "rxjs";
import { ConnectionManager, OutGoingMsg } from "./lib/connection";
import { MsgClientToServer } from "./shared/protocols/MsgClientToServer";
import { RequestResolver} from "./lib/room"


const clientToServerSubject = new Subject<MsgClientToServer>()
const outgoingSubject = new Subject<OutGoingMsg>()

const connectionManager = new ConnectionManager(clientToServerSubject, outgoingSubject)
const requestResolver = new RequestResolver(clientToServerSubject, outgoingSubject)

connectionManager.start()