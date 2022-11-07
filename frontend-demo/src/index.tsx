import ReactDOM from 'react-dom';
import { mockClient, StockioClient } from 'frontend'
import { RoomId, UserId } from 'frontend/build/main/shared/protocols/model';
import { PongRes, RoomDetailRes, TickRes } from 'frontend/build/main/shared/protocols/MsgServerToClient';

const App = () => <div className='App'>
    <h1>TSRPC Chatroom</h1>
</div>

ReactDOM.render(<App />, document.getElementById('app'));


const client = StockioClient.create({
    userId: UserId("my user id"),
    onPongRes: (pong: PongRes) => console.log("pong ----->" + JSON.stringify(pong)),
    onTickRes: (tick: TickRes) => console.log(tick),
    onRoomDetailRes: (rd: RoomDetailRes) => console.log(rd)
  }).then(
    c => c.sendReq({kind: "PingReq"})
  )