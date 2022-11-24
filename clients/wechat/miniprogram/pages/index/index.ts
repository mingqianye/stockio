// index.ts
import IAppOption from "../../interface/IAppOption";

const app = getApp<IAppOption>()

Page({
  data: {},

  async onLoad() {},

  async onShow() {},

  // 点击排位赛
  onTeamClicked() {
    wx.navigateTo({
      url: '../team/team',
    })
  },

  // 点击创建房间
  onRoomClicked() {
    wx.navigateTo({
      url: '../room/room',
    })
  },

})
