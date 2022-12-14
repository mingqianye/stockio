import { BaseWsClient } from "tsrpc-base-client"
import { UserId } from "./protocols/model";
import { Req } from "./protocols/MsgClientToServer";
import { MsgServerToClient, PongRes, Res, RoomDetailRes, ServerErrorRes, TickRes } from "./protocols/MsgServerToClient";
import { ServiceType } from "./protocols/serviceProto";

export type ClientOpts = {
  userId: UserId
  onUnableToConnect: Callback
}

export class StockioClient {
  _wsClient: BaseWsClient<ServiceType>
  _clientOpts: ClientOpts
  _callbacks: Map<(MsgServerToClient|ConnectionRes)['kind'], Callback> = new Map()
  _catchAllCallback: (msg: MsgServerToClient|ConnectionRes) => unknown

  static _printError: Callback = res => console.error(`Received ${res} but onXXX function is not available.`)

  constructor(wsClient: BaseWsClient<ServiceType>, clientOpts: ClientOpts) {
    this._wsClient = wsClient
    this._clientOpts = clientOpts
    this._callbacks.set("WebsocketDisconnectedRes", clientOpts.onUnableToConnect)
    this._catchAllCallback = () => {}
  }

  async connect() {
    const {isSucc, errMsg} = await this._wsClient.connect()
    if (isSucc === false) {
      this._clientOpts.onUnableToConnect(errMsg)
      return this
    }

    this._wsClient.listenMsg("ServerToClient", msg => {
      const callback = this._callbacks.get(msg.kind) || StockioClient._printError
      callback(msg)
    })
    this._wsClient.flows.postDisconnectFlow.push(v => {
      console.log(`Websocket disconnected: ${JSON.stringify(v)}`)
      if (!v.isManual) {
        retry({
          intervalMs: 2000,
          remainingRetries: 100,
          task: () => this._wsClient.connect(),
          isSuccess: result => result.isSucc,
          onSuccess: () => this._callbacks.get("WebsocketReconnectedRes")!(),
          onFailure: result => this._callbacks.get("WebsocketDisconnectedRes")!(result.errMsg!)
        })
      }
      return v
    })

    this.sendReq({kind: "ConnectReq"})
    return this
  }

  sendReq(req: Req) {
    return this._wsClient.sendMsg('ClientToServer', {
      ...req,
      userId: this._clientOpts.userId as UserId,
      ts: new Date()
    })
  }

  onRes(f: (res: MsgServerToClient|ConnectionRes) => unknown) {
    this._catchAllCallback = f
  }

  onPongRes(f: (res: PongRes) => unknown) {
    this._callbacks.set("PongRes", f as Callback)
  }

  onTickRes(f: (res: TickRes) => unknown) {
    this._callbacks.set("TickRes", f as Callback)
  }

  onRoomDetail(f: (res: RoomDetailRes) => unknown) {
    this._callbacks.set("RoomDetailRes", f as Callback)
  }

  onServerErrorRes(f: (res: ServerErrorRes) => unknown) {
    this._callbacks.set("ServerErrorRes", f as Callback)
  }

  onDisconnected(f: (err: string) => unknown) {
    this._callbacks.set("WebsocketDisconnectedRes", f as Callback)
  }

  onReconnected(f: () => unknown) {
    this._callbacks.set("WebsocketReconnectedRes", f as Callback)
  }
}

type ConnectionRes =
  | WebsocketDisconnectedRes
  | WebsocketReconnectedRes

export type WebsocketDisconnectedRes = {
  kind: 'WebsocketDisconnectedRes'
  err: string
}

export type WebsocketReconnectedRes = {
  kind: 'WebsocketReconnectedRes'
}

type Callback = (res: Res|ConnectionRes|string|void) => unknown

function retry<T>(opts: RetryOpts<T>) {
  setTimeout(async () => {
    if (opts.remainingRetries <= 0) {
      return
    }
    const taskResult = await opts.task()

    if (opts.isSuccess(taskResult)) {
      opts.onSuccess(taskResult)
      return
    }

    opts.onFailure(taskResult)

    retry({
      ...opts, 
      remainingRetries: opts.remainingRetries - 1
    })
  }, opts.intervalMs)
}

type RetryOpts<T> = {
  intervalMs: number,
  remainingRetries: number,
  task: () => Promise<T>
  isSuccess: (result: T) => boolean
  onSuccess: (result: T) => unknown
  onFailure: (result: T) => unknown
}
