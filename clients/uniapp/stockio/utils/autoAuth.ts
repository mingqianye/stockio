import IAppOption from "../interface/IAppOption"
import { create } from "../client/client"
import { UserId } from "../client/shared/protocols/model"
import { ServerErrorRes } from '../client/shared/protocols/MsgServerToClient';
import { promisify } from "../utils/util"
import { StockioClient } from "../client/shared/clientCore";

// 对login进行promise化
const wxLogin = promisify(wx.login)

// 获取用户信息
const getUserInfo = async (_app: IAppOption) => {
  const wxloginRes: any = await wxLogin();
  _app.globalData.userInfo = wxloginRes.code
}

// 创建websocket连接
const checkAuth = async (_app: IAppOption) => {
  await getUserInfo(_app)
  const stockioClient: StockioClient = await create({ 
    userId: UserId(_app.globalData.userInfo), 
    onUnableToConnect: err => _app.globalData.connection = false
  })
  stockioClient.onDisconnected(err => _app.globalData.connection = false)
  stockioClient.onReconnected(() => _app.globalData.connection = true)
  // 连接成功后，初始化globalData.stockioClient
  _app.globalData.connection == undefined && (_app.globalData.stockioClient = stockioClient)
  // console.log("============", _app.globalData.stockioClient)
}

// 自动连接websocket的main方法
const autoAuth = async (_app: IAppOption) => {
  return checkAuth(_app)
}

export default autoAuth