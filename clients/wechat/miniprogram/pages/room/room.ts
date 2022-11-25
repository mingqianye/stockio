import IAppOption from "../../interface/IAppOption"
import { StockioClient } from "../../client/shared/clientCore"

import { RoomId } from "../../client/shared/protocols/model"
import { RoomDetailRes } from '../../client/shared/protocols/MsgServerToClient'
import { EnterRandomRoomReq } from '../../client/shared/protocols/MsgClientToServer'
import { setWatcher } from '../../utils/watch'

const app = getApp<IAppOption>()
var stockioClient: StockioClient | undefined

Page({

  data: {
    userList: [
      {
        userid: 1,
        name: '',
        imgUrl: ''
      },
      {
        userid: 2,
        name: ''
      },
      {
        userid: 3,
        name: '',
        imgUrl: ''
      },
      {
        userid: 4,
        name: '',
        imgUrl: ''
      },
      {
        userid: 5,
        name: '',
        imgUrl: ''
      },
      {
        userid: 6,
        name: '',
        imgUrl: ''
      },
      {
        userid: 7,
        name: '',
        imgUrl: ''
      },
      {
        userid: 8,
        name: '',
        imgUrl: ''
      },
      {
        userid: 9,
        name: '',
        imgUrl: ''
      },
      {
        userid: 10,
        name: '',
        imgUrl: ''
      }
    ],
    enterRandomRoomReq: {},
    roomId: ''
  },

  watch: {
    enterRandomRoomReq(val: EnterRandomRoomReq) {
      console.log('enterRandomRoomReq变化了，变化后的值是', val)
      // 准备对Coating文件进行修改
    }
  },

  async onLoad(options) {
    stockioClient = app.globalData.stockioClient
    setWatcher(this)
    if(options.roomId) {
      // await this.enterRoom()
    } else {
      await this.createRoom()
    }
  },

  async onShow() {},

  async onUnload() { await this.leaveRoom() },

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
  async enterRoom(roomId: RoomId) {
    await stockioClient?.onRoomDetail((res: RoomDetailRes) => {
      this.setData({ enterRandomRoomReq: res })
    })
    await stockioClient?.sendReq({kind: "EnterRandomRoomReq", roomId: roomId})
  },

  // 如果进入房间时RoomId为空，则视为创建新房间
  async createRoom() {
    await stockioClient?.onRoomDetail((res: RoomDetailRes) => {
      console.log("getting RoomDetails:", res)
      this.setData({ 
        enterRandomRoomReq: res,
        roomId: res.roomId
      })
    })
    await stockioClient?.sendReq({kind: "EnterRandomRoomReq"})
  },

  // 卸载页面时候，离开房间
  async leaveRoom() { await stockioClient?.sendReq({ kind: "LeaveRoomReq" }) },

})