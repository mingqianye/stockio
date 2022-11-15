// app.ts
import { create } from "./client/client"
import { RoomId, UserId } from "./client/shared/protocols/model"
import { PongRes, RoomDetailRes, TickRes } from './client/shared/protocols/MsgServerToClient';
import IAppOption from "./interface/IAppOption";

App<IAppOption>({
  globalData: {
  },
  async onLaunch() {
    // // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     console.log(res.code)
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   },
    // })
    console.log("==========")
    const stockioClient = await create({
      userId: UserId("my user id")
    })
    
    this.globalData.stockioClient = stockioClient

    console.log("aaa", this.globalData.stockioClient)
    // this.globalData.stockioClient?.onPongRes((res: PongRes) => console.log("--->", JSON.stringify(res)))
    this.globalData.stockioClient?.sendReq({kind: "PingReq"})
  },
})