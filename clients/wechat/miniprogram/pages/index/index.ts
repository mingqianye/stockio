// index.ts
// // 获取应用实例
import { create } from "../../client/client"
import { RoomId, UserId } from "../../client/shared/protocols/model"
import { PongRes, RoomDetailRes, TickRes } from '../../client/shared/protocols/MsgServerToClient';
import IAppOption from "../../interface/IAppOption";
import { promisify } from "../../utils/util"
import { StockioClient } from "../../client/shared/clientCore";

const app = getApp<IAppOption>()
var stockioClient: StockioClient | undefined

Page({
  data: {},

  // 生命周期
  async onLoad() {
  },
  async onShow() {
    await this.getUserInfo()
    await this.createStockioClient()
    stockioClient = app.globalData.stockioClient
  },

  // 事件处理函数
  onTeamClicked() {
    // let stockioClient = app.globalData.stockioClient
    // stockioClient?.onPongRes((res: PongRes) => console.log("--->", JSON.stringify(res)))
    // stockioClient?.sendReq({kind: "PingReq"})
    wx.navigateTo({
      url: '../team/team',
    })
  },
  onRoomClicked() {

  },
  
  // 创建stockioClient，在此初始化
  async createStockioClient() {
    const stockioClient: StockioClient = await create({ userId: UserId(app.globalData.userInfo) })
    app.globalData.stockioClient = stockioClient
  },

  // 对login进行promise化
  wxLogin: promisify(wx.login),

  // 获取用户信息
  async getUserInfo() {
    const wxloginRes: any = await this.wxLogin();
    app.globalData.userInfo = wxloginRes.code
  }
})
