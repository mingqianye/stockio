import IAppOption from "../../interface/IAppOption"
const app = getApp<IAppOption>()

const { statusBarHeight } = wx.getSystemInfoSync();
const menuButtonObject = wx.getMenuButtonBoundingClientRect();
const { top, height } = menuButtonObject;
const navBarHeight = height + (top - statusBarHeight) * 2;

Component({

  properties: {
    playerList: Array,
    roomRole: String,
  },

  data: {
    listHeight: app.globalData.systemInfo.windowHeight-(720*app.globalData.systemInfo.windowWidth/750)-app.globalData.systemInfo.statusBarHeight-navBarHeight
  },

  methods: {

  }
})
