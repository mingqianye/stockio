import IAppOption from "../../interface/IAppOption";
import { PongRes, RoomDetailRes, TickRes } from '../../client/shared/protocols/MsgServerToClient';
import { StockioClient } from "../../client/shared/clientCore";

const app = getApp<IAppOption>()
let stockioClient: StockioClient

Page({
  stockioClient: StockioClient,

  data: {
    roomDetailRes: {}
  },

  onLoad() {

  },

  onShow() {
    stockioClient = app.globalData.stockioClient
  },

  async onRoom() {
    await stockioClient.onRoomDetail((res: RoomDetailRes) => {
      console.log("getting RoomDetails:", res)
      this.setData({
        roomDetailRes: res
      })
    })
    await stockioClient.sendReq({kind: "EnterRandomRoomReq"})
    console.log("===", this.data.roomDetailRes)
    stockioClient.onTickRes((res: TickRes) => console.log("getting tick: ", res))
    stockioClient.sendReq({kind: "StartGameReq"})
    wx.navigateTo({
      url: '../queue/queue?roomId=' + this.data.roomDetailRes.roomId,
    })
  }

})