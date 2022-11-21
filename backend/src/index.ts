import { Observable, Subject } from "rxjs";
import * as connection from "./lib/connection";
import { MsgClientToServer } from "./shared/protocols/MsgClientToServer";
import * as resolver from "./lib/resolver"
import { enableMapSet } from "immer";

enableMapSet()


const reqObservable: Observable<MsgClientToServer> = connection.reqObservable

const resObservable: Observable<connection.OutGoingMsg> = resolver.resolve(reqObservable)

connection.start(resObservable).catch(console.error)