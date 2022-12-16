const app = getApp()

Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },

  properties: {
    extClass: {
      type: String,
      value: ''
    },
    //导航标题名称，如果不传，可以使用center的slot
    title: {
      type: String,
      value: ''
    },
    //是否有首页，如果为false
    home: {
      type: Boolean,
      value: false,
    },
    //是否有返回箭头，如果为false，可以使用left的slot
    back: {
      type: Boolean,
      value: false,
    },
    //是否触发back自定义事件
    backFunc: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: app.globalData.systemInfo.statusBarHeight
  },

  methods: {
    goBack() {
      const data = this.data;
      if (data.backFunc) {
        this.triggerEvent('back')
      } else {
        wx.navigateBack()
      }
    },

    goHome() {
      wx.reLaunch({ url: '/pages/index/index' })
    }
  }
})
