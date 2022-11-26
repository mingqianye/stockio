import ReactDOM from 'react-dom';
import { UserId } from "./shared/protocols/model"
import { create } from './client';
import { PongRes, RoomDetailRes, TickRes } from './shared/protocols/MsgServerToClient';

const App = () => <div className='App'>
    <h1>TSRPC Chatroom</h1>
</div>

ReactDOM.render(<App />, document.getElementById('app'));

(async () => { // top-level await for react
  console.log("before create()")

  const stockioClient = await create({
      userId: UserId("my user id"),
    })

  console.log("after create()")

  stockioClient.onPongRes((res: PongRes) => console.log("--->", JSON.stringify(res)))

  console.log("sending pingReq")
  stockioClient.sendReq({kind: "PingReq"})

  stockioClient.onRoomDetail((res: RoomDetailRes) => console.log("getting RoomDetails:", res))
  stockioClient.onTickRes((res: TickRes) => console.log("getting tick: ", res))

  stockioClient.onDisconnected(err => console.log("websocket is disconnected: ", err))
  stockioClient.onReconnected(() => console.log("websocket is reconnected."))

  console.log("sending room requests")
  stockioClient.sendReq({kind: "CreateRoomReq"})
  stockioClient.sendReq({kind: "StartGameReq"})

})()