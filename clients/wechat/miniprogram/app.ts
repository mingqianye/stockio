import IAppOption from "./interface/IAppOption";
import autoCheck from "./utils/autoCheck"

App<IAppOption>({
  globalData: {
    userInfo: "",
    connection: undefined,
    userSituation: {
      roomId: '',
      teamId: '',
      gameId: '',
    }
  },

  async onLaunch() {
    const _this = this
    new Promise(async (resolve, reject) => {
      // 获取系统状态栏信息
      await wx.getSystemInfo({ success: e => this.globalData.systemInfo = e })

      // 开启动态监听globalData钩子
      // await this.observeGlobalData();

      // 自动检查（登录、网络）
      await autoCheck(this)
      resolve(1)
    }).then(() => {
      if(_this.pageCallback) {
        _this.pageCallback(1)
      }
    })
  },

  onShow: async function () {},

  // 对globaldata进行实时监听
  watch: function(variate, callback) {
    var obj = this.globalData;
    let val = obj[variate as keyof typeof obj];
    Object.defineProperty(obj, variate, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        val = value;
        // console.log('是否会被执行2', variate, callback)
        callback(variate, value);
      },
      get:function(){
        return val
      }
    })
  },

  // observeGlobalData() {
  //   this.globalData && Object.keys(this.globalData).forEach((key, i) => {
  //     this.observe(this.globalData, key)
  //   })
  // },

  // observe(obj, key) {
  //   let _this = this;
  //   let val = obj[key];
  //   Object.defineProperty(obj, key, {
  //     configurable: true,
  //     enumerable: true,
  //     set: function (value) {
  //       if (val !== value) {
  //         val = value;
  //         _this.emitWatch(obj, key, value)
  //       }
  //     },
  //     get: function () {
  //       return val
  //     }
  //   })
  // },

  // emitWatch(obj, key, value) {
  //   this.eventQueue && this.eventQueue.forEach((e, i) => {
  //     if (e.context) {
  //       if (e.callback[key] && typeof e.callback[key] == 'function') {
  //         e.callback[key].call(e.context, value)
  //       }
  //     }
  //   })
  // },

  // onWatch(context) {
  //   // eventQueue:[{context,callback}]
  //   if (context) {
  //     let callback = {};
  //     //如果watchGlobal是方法（解决在组件中使用的问题）
  //     if (typeof context.watchGlobal == 'function') { callback = (context.watchGlobal() || {}) }
  //     //如果watchGlobal是对象
  //     if (typeof context.watchGlobal == 'object') { callback = context.watchGlobal }
  //     this.eventQueue = this.eventQueue || [];
  //     this.eventQueue.push({ context, callback })
  //   }
  // },

  // offWatch(context) {
  //   this.eventQueue && this.eventQueue.forEach((e, i) => {
  //     if (e.context == context) {
  //       this.eventQueue.splice(i, 1)
  //     }
  //   })
  // },

})