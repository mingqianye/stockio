// index.ts
// // 获取应用实例
import { create } from "../../client/client"
import { RoomId, UserId } from "../../client/shared/protocols/model"
import { PongRes, RoomDetailRes, TickRes } from '../../client/shared/protocols/MsgServerToClient';
import IAppOption from "../../interface/IAppOption";
import { promisify } from "../../utils/util"
import { StockioClient } from "../../client/shared/clientCore";

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
    let stockioClient = app.globalData.stockioClient
    console.log(stockioClient)
    stockioClient.onPongRes((res: PongRes) => console.log("--->", JSON.stringify(res)))
    stockioClient.sendReq({kind: "PingReq"})
    wx.navigateTo({
      url: '../team/team',
    })
  },
  async onLoad() {
  },
  async onShow() {
    await this.getUserInfo()
    await this.createStockioClient()
  },

  async createStockioClient() {
    const stockioClient: StockioClient = await create({ userId: UserId(app.globalData.userInfo) })
    app.globalData.stockioClient = stockioClient
  },

  wxLogin: promisify(wx.login),

  async getUserInfo() {
    const wxloginRes: any = await this.wxLogin();
    app.globalData.userInfo = wxloginRes.code
    console.log(app.globalData.userInfo)
  }
})
