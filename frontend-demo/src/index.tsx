import ReactDOM from 'react-dom';
import { RoomId, UserId } from "./shared/protocols/model"
import { PongRes, RoomDetailRes, TickRes } from './shared/protocols/MsgServerToClient';
import { create } from './client';

const App = () => <div className='App'>
    <h1>TSRPC Chatroom</h1>
</div>

ReactDOM.render(<App />, document.getElementById('app'));

create({
    userId: UserId("my user id"),
    onPongRes: (pong: PongRes) => console.log("pong ----->" + JSON.stringify(pong)),
    onTickRes: (tick: TickRes) => console.log(tick),
    onRoomDetailRes: (rd: RoomDetailRes) => console.log(rd)
  }).then(
    c => c.sendReq({kind: "PingReq"})
  )