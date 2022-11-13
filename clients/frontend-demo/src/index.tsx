import ReactDOM from 'react-dom';
import { UserId } from "./shared/protocols/model"
import { create } from './client';
import { PongRes } from './shared/protocols/MsgServerToClient';

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
  stockioClient.sendReq({kind: "PingReq"})

})()