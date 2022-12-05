// components/joinRoomContent/index.ts
Component({

  properties: {},

  data: {
    joinRoomShow: false, // 展示输入房间ID的图层
    value: '',
  },

  methods: {
    // 展示加入房间图层
    onJoinRoomShow: function() { this.setData({ joinRoomShow: true }) },

    // 展示加入房间图层
    onJoinRoomHide: function() { this.setData({ joinRoomShow: false }) },
  }
})
