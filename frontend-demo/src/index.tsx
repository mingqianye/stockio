import ReactDOM from 'react-dom';
import { mockClient } from 'frontend'

const App = () => <div className='App'>
    <h1>TSRPC Chatroom</h1>
</div>

ReactDOM.render(<App />, document.getElementById('app'));

mockClient()
  .then(c => c.sendReq({kind: "PingReq"}))
  .catch(console.error)