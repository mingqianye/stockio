// app.ts
import { create } from "./client/client"
import { RoomId, UserId } from "./client/shared/protocols/model"
import { PongRes, RoomDetailRes, TickRes } from './client/shared/protocols/MsgServerToClient';
import IAppOption from "./interface/IAppOption";

App<IAppOption>({
  globalData: {
  },
  async onLaunch() {
    console.log("==========")
    const newSocket = await create({
      userId: UserId("my user id"),
      onPongRes: (pong: PongRes) => console.log("pong ----->" + JSON.stringify(pong)),
      onTickRes: (tick: TickRes) => console.log(tick),
      onRoomDetailRes: (rd: RoomDetailRes) => console.log(rd)
    })
    console.log("aaaa", newSocket)
    this.globalData.socket = newSocket

    console.log("aaa", this.globalData.socket)
    // this.globalData.socket?.sendReq({kind: "PingReq"})
  },
})