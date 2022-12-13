
Component({

  properties: {
    roomId: String,
    teamId: String,
  },

  data: {
    show: false,
  },

  methods: {
    // 点击箭头
    onChooseClicked: function() { this.setData({ show: !this.data.show }) },

    onPopupClosed: function() { this.setData({ show: false }) }
  }
})
