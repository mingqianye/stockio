import { Subject } from "rxjs";
import { ConnectionManager } from "./lib/connection";
import { MsgClientToServer } from "./shared/protocols/MsgClientToServer";
import { RequestResolver} from "./lib/resolver"


const clientToServerSubject = new Subject<MsgClientToServer>()
const outgoingStream = new RequestResolver(clientToServerSubject).outgoingStream

ConnectionManager.createAndStart(clientToServerSubject, outgoingStream)
  .catch(console.error)