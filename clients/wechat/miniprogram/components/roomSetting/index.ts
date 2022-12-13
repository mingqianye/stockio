// components/roomSetting/index.ts
Component({

  properties: {
    roomId: String,
  },

  data: {
    roomSettingShow: false,
    passwordInput: '',
  },

  methods: {
    // 展示设置图层
    onRoomSettingShow: function() { this.setData({ roomSettingShow: true }) },

    // 隐藏设置图层
    onRoomSettingHide: function() { this.setData({ roomSettingShow: false }) },

    bindInput: function(e) { this.setData({ passwordInput: e.detail.value }) }
  }
})
