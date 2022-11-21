import IAppOption from "../../interface/IAppOption";
import { PongRes, RoomDetailRes, TickRes } from '../../client/shared/protocols/MsgServerToClient';
import { StockioClient } from "../../client/shared/clientCore";

const app = getApp<IAppOption>()
let stockioClient: StockioClient

Page({
  stockioClient: StockioClient,

  data: {

  },

  onLoad() {

  },

  onShow() {
    stockioClient = app.globalData.stockioClient
  },

  onRoom() {
    console.log("===", stockioClient)
    stockioClient.onRoomDetail((res: RoomDetailRes) => console.log("getting RoomDetails:", res))
    stockioClient.sendReq({kind: "EnterRandomRoomReq"})
  }

})