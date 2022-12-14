import IAppOption from "../../../../interface/IAppOption"
const app = getApp<IAppOption>()

Component({

  properties: {
    playerList: Array,
    roomRole: String,
  },

  data: {
    listHeight: app.globalData.systemInfo.windowHeight-(720*app.globalData.systemInfo.windowWidth/750)-(app.globalData.systemInfo.statusBarHeight+44)*2
  },

  methods: {
    // 离开按钮
    onPlayerLeaveClicked: function() { console.log(app.globalData.systemInfo.statusBarHeight) },
  }
})
