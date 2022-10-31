import * as path from "path";
import { Subject } from "rxjs";
import { MsgCall, WsServer } from "tsrpc";
import { ConnectionManager, OutGoingMsg } from "./lib/connection";
import { MsgClientToServer } from "./shared/protocols/MsgClientToServer";
import { serviceProto } from './shared/protocols/serviceProto';



// Entry function
async function main() {
    const connectionManager = new ConnectionManager((msg) => console.log(msg))
}
main();