// index.ts

Page({
  data: {
    joinRoomShow: false,  // 展示输入房间ID的图层
    value: '',
  },

  onLoad: function() {},

  onShow: function() {},

  // 点击匹配赛
  onTeamClicked: function() { wx.navigateTo({ url: '../team/team' }) },

  // 点击创建房间
  onCreateRoomClicked: function() { wx.navigateTo({ url: '../room/room' }) },

  // 展示加入房间图层
  onJoinRoomShow: function() { this.setData({ joinRoomShow: true }) },

  // 展示加入房间图层
  onJoinRoomHide: function() { this.setData({ joinRoomShow: false }) },

})
