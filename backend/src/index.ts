import { Observable, Subject } from "rxjs";
import * as connection from "./lib/connection";
import { MsgClientToServer } from "./shared/protocols/MsgClientToServer";
import * as resolver from "./lib/resolver"


const reqObservable: Observable<MsgClientToServer> = connection.reqObservable

const outgoingStream: Observable<connection.OutGoingMsg> = resolver.resolve(reqObservable)

connection.start(outgoingStream).catch(console.error)