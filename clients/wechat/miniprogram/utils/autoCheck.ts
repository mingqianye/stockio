import IAppOption from "../interface/IAppOption"
import { create } from "../client/client"
import { UserId } from "../client/shared/protocols/model"
import { ServerErrorRes } from '../client/shared/protocols/MsgServerToClient';
import { promisify } from "./util"
import { StockioClient } from "../client/shared/clientCore";

// 对login进行promise化
const wxLogin = promisify(wx.login)

// 监听变量，并执行弹出框，或隐藏弹出框
const watchBack = (_app: IAppOption, variate: any, msg: string) => {
  if(!_app.globalData[variate as keyof typeof _app.globalData]) {
    wx.showLoading({ title: msg, mask: true })
  } else {
    wx.hideLoading()
  }
}

// 获取并设置用户信息到globaldata
const configUserInfo = async (_app: IAppOption) => {
  // 这里需要补充内容
  const wxloginRes: any = await wxLogin();
  _app.globalData.userInfo = wxloginRes.code
  wx.setStorageSync('userInfo', _app.globalData.userInfo)
}

// 检测用户信息（不存在则loading）
const checkUserInfo = async (_app: IAppOption) => {
  // userInfo为空时，触发loading并锁定屏幕
  !_app.globalData.userInfo && wx.showLoading({ title: '获取用户信息', mask: true })
  
  // 开启全局监听userInfo
  _app.watch('userInfo', () => { watchBack(_app, 'userInfo', '获取用户信息') })
  console.log('watcher', _app.globalData.userInfo)
  // 从缓存获取userInfo
  _app.globalData.userInfo = wx.getStorageSync('userInfo')

  // 获取并设置userInfo到globaldata
  await configUserInfo(_app)

  console.log('watcher', _app.globalData)
}

// 创建websocket连接
const checkNetwork = async (_app: IAppOption) => {
  if(_app.globalData.userInfo) {
    // connection为false或undefined时，触发loading并锁定屏幕
    !_app.globalData.connection && wx.showLoading({ title: '正在连接网络', mask: true })

    // 开启全局监听connection
    _app.watch('connection', () => { watchBack(_app, 'connection', '正在连接网络') })
    
    // 连接stockioClient
    const stockioClient: StockioClient = await create({ 
      userId: UserId(_app.globalData.userInfo), 
      onUnableToConnect: err => _app.globalData.connection = false
    })
    stockioClient.onDisconnected( (err) => {
      _app.globalData.connection = false
    })
    stockioClient.onReconnected(() => {
      _app.globalData.connection = true
    })

    // 连接成功后，初始化globalData.stockioClient和connection
    _app.globalData.connection == undefined && (_app.globalData.stockioClient = stockioClient)

    // 暂时设置
    _app.globalData.connection = true
  }
}

// 定位用户页面位置
const checkUserSituation = async (_app: IAppOption) => {
  if(_app.globalData.connection) {
    _app.watch('userSituation', () => {
      let userSituation = _app.globalData.userSituation
      // 配对位置并跳转
      if(!userSituation.gameId && !userSituation.teamId && !userSituation.gameId) {}
    })
  }
}

// 自动连接websocket的main方法
const autoCheck = async (_app: IAppOption) => {
  await checkUserInfo(_app)
  await checkNetwork(_app)
  await checkUserSituation(_app)
}

export default autoCheck