import { WsClient } from "tsrpc-browser"
import { ClientOpts, StockioClient } from "./shared/clientCore";
import { serviceProto } from "./shared/protocols/serviceProto";

const wsClient = new WsClient(serviceProto, {
  server: "ws://127.0.0.1:3000",
  //logger: console,
})

export const create = (clientOpts: ClientOpts) => 
  new StockioClient(wsClient, clientOpts).connect()