// app.ts
// import { create } from "./client/client"
// import { RoomId, UserId } from "./client/shared/protocols/model"
// import { PongRes, RoomDetailRes, TickRes } from './client/shared/protocols/MsgServerToClient';
import IAppOption from "./interface/IAppOption";

App<IAppOption>({
  globalData: {
  },
  async onLaunch() {
    // 获取系统状态栏信息
    wx.getSystemInfo({ success: e => console.log(e) })

    // 开启动态监听globalData钩子
    await this.observeGlobalData();

    // console.log("==========")
    // const stockioClient = await create({
    //   userId: UserId("my user id")
    // })
    
    // this.globalData.stockioClient = stockioClient

    // console.log("aaa", this.globalData.stockioClient)
    // // this.globalData.stockioClient?.onPongRes((res: PongRes) => console.log("--->", JSON.stringify(res)))
    // this.globalData.stockioClient?.sendReq({kind: "PingReq"})
    // console.log(this.eventQueue)
  },

  observeGlobalData() {
    this.globalData && Object.keys(this.globalData).forEach((key, i) => {
      this.observe(this.globalData, key)
    })
  },

  observe(obj, key) {
    let _this = this;
    let val = obj[key];
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: function (value) {
        if (val !== value) {
          val = value;
          _this.emitWatch(obj, key, value)
        }
      },
      get: function () {
        return val
      }
    })
  },

  emitWatch(obj, key, value) {
    this.eventQueue && this.eventQueue.forEach((e, i) => {
      if (e.context) {
        if (e.callback[key] && typeof e.callback[key] == 'function') {
          e.callback[key].call(e.context, value)
        }
      }
    })
  },

  onWatch(context) {
    // eventQueue:[{context,callback}]
    if (context) {
      let callback = {};
      //如果watchGlobal是方法（解决在组件中使用的问题）
      if (typeof context.watchGlobal == 'function') { callback = (context.watchGlobal() || {}) }
      //如果watchGlobal是对象
      if (typeof context.watchGlobal == 'object') { callback = context.watchGlobal }
      this.eventQueue = this.eventQueue || [];
      this.eventQueue.push({ context, callback })
    }
  },

  offWatch(context) {
    this.eventQueue && this.eventQueue.forEach((e, i) => {
      if (e.context == context) {
        this.eventQueue.splice(i, 1)
      }
    })
  },

})