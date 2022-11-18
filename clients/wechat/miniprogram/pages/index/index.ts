// index.ts
// // 获取应用实例
import { create } from "../../client/client"
import { RoomId, UserId } from "../../client/shared/protocols/model"
import { PongRes, RoomDetailRes, TickRes } from '../../client/shared/protocols/MsgServerToClient';
import IAppOption from "../../interface/IAppOption";
import { promisify } from "../../utils/util"

const app = getApp<IAppOption>()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  goTeam() {
    wx.navigateTo({
      url: '../team/team',
    })
  },
  async onLoad() {
    // create({
    //   userId: UserId("my user id"),
    //   onPongRes: (pong: PongRes) => console.log("pong ----->" + JSON.stringify(pong)),
    //   onTickRes: (tick: TickRes) => console.log(tick),
    //   onRoomDetailRes: (rd: RoomDetailRes) => console.log(rd)
    // }).then(
    //   c => req = c
    // )
    // await app.globalData.socket.sendReq({kind: "PingReq"})
    
    // @ts-ignore
  },
  async onShow() {
    // await app.globalData.socket.sendReq({kind: "PingReq"})
    // console.log(app.globalData.socket)
    await this.getUserInfo()
  },

  wxLogin: promisify(wx.login),
  
  async getUserInfo() {
    const wxloginRes: any = await this.wxLogin();
    app.globalData.userInfo = wxloginRes.code
    console.log(app.globalData.userInfo)
  }
})
