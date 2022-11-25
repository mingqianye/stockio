// index.ts

Page({
  data: {},

  onLoad: function() {},

  onShow: function() {},

  // 点击排位赛
  onTeamClicked: function() { wx.navigateTo({ url: '../team/team' }) },

  // 点击创建房间
  onRoomClicked: function() { wx.navigateTo({ url: '../room/room' }) },

})
