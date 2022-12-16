import IAppOption from "../../interface/IAppOption";
import { PongRes, RoomDetailRes, TickRes } from '../../client/shared/protocols/MsgServerToClient';
import { StockioClient } from "../../client/shared/clientCore";
import { _personalCard, _teamPlayerList } from './rankedCoating'

const app = getApp<IAppOption>()
let stockioClient: StockioClient

Page({
  stockioClient: StockioClient,

  data: {
    // 请求
    roomDetailRes: {},
    // 需要获取的值
    teamId: '',
    // 渲染层
    personalCard: {},
    // 一般动画
    cardStatus: 'personal',
  },

  onLoad() {

  },

  onShow() {
    stockioClient = app.globalData.stockioClient

    // 初始化
    this.setData({
      personalCard: _personalCard,
      teamPlayerList: _teamPlayerList,
    })
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
  },

  onPersonalCardClicked: function() { this.setData({ cardStatus: 'personal' }) },

  onTeamCardClicked: function() { this.setData({ cardStatus: 'team' }) },

})