// index.ts

Page({
  data: {
    joinRoomShow: false
  },

  onLoad: function() {},

  onShow: function() {},

  // 点击匹配赛
  onTeamClicked: function() { wx.navigateTo({ url: '../team/team' }) },

  // 点击创建房间
  onCreateRoomClicked: function() { wx.navigateTo({ url: '../room/room' }) },

  // 点击加入房间
  onJoinRoomClicked: function() { this.selectComponent("#joinRoomContent").onJoinRoomShow() },
  

})
