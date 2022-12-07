import IAppOption from "../../interface/IAppOption"
import { StockioClient } from "../../client/shared/clientCore"

import { RoomId } from "../../client/shared/protocols/model"
import { RoomDetailRes } from '../../client/shared/protocols/MsgServerToClient'
import { CreateRoomReq, EnterRoomReq } from '../../client/shared/protocols/MsgClientToServer'
import { IPersonalCard, _personalCard } from './roomCoating'
import { setWatcher } from '../../utils/watch'

const app = getApp<IAppOption>()
var stockioClient: StockioClient | undefined

Page({
  data: {
    enterRoomReq: {},
    createRoomReq: {},
    roomId: '',
    personalCard: {}
  },

  watch: {
    CreateRoomReq(val: CreateRoomReq) {
      console.log('CreateRoomReq变化了，变化后的值是', val)
      // 准备对Coating文件进行修改
    }
  },

  onLoad: async function(options) {
    console.log("bbbb")
    
    setWatcher(this)
    if(options.roomId) {
      app.pageCallback = async () => {
        stockioClient = app.globalData.stockioClient
        await this.enterRoom(options.roomId)
      }
    } else {
      stockioClient = app.globalData.stockioClient
      await this.createRoom()
    }
  },

  onShow: function() { this.setData({ personalCard: _personalCard}) },

  onUnload: async function() { await this.leaveRoom() },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮，如：<button open-type="share"></button>
      console.log(res.target)
    }
    return {
      title: '自定义转发标题',
      path: '/pages/room/room?roomId=' + this.data.roomId,
      imageUrl: '自定义图片地址'
    }
  },

  // 如果进入房间时带有RoomId，则视为加入房间
  enterRoom: async function(roomId: RoomId) {
    console.log(roomId)
    await stockioClient?.onRoomDetail((res: RoomDetailRes) => {
      console.log("getting RoomDetails:", res)
      this.setData({ 
        enterRandomRoomReq: res,
        roomId: res.roomId
      })
    })
    await stockioClient?.sendReq({kind: "EnterRoomReq", roomId: roomId})
    console.log(this.data.enterRoomReq)
  },

  // 如果进入房间时RoomId为空，则视为创建新房间
  createRoom: async function() {
    await stockioClient?.onRoomDetail((res: RoomDetailRes) => {
      console.log("getting RoomDetails:", res)
      this.setData({ 
        enterRandomRoomReq: res,
        roomId: res.roomId
      })
    })
    await stockioClient?.sendReq({kind: "CreateRoomReq"})
  },

  // 卸载页面时候，离开房间
  leaveRoom: async function() { await stockioClient?.sendReq({ kind: "LeaveRoomReq" }) },

})