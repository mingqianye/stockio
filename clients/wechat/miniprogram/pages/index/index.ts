
Page({
  data: {},

  onLoad: function() {},

  onShow: function() {},

  // 点击匹配赛
  onTeamClicked: function() { wx.navigateTo({ url: '../team/team' }) },

  // 点击创建房间
  onCreateRoomClicked: function() { wx.navigateTo({ url: '../room/room' }) },

  // 点击加入房间
  onJoinRoomClicked: function() { this.selectComponent("#joinRoomContent").onJoinRoomShow() },

  // 点击战术点评
  onForumClicked: function() {},

  // 点击数据分析
  onAnalysisClicked: function() {},

  // 点击用户信息
  onUserClicked: function() {},
  
})
