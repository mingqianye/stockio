import ReactDOM from 'react-dom';
import { mockClient } from './getClient';

const App = () => <div className='App'>
    <h1>TSRPC Chatroom</h1>
</div>

ReactDOM.render(<App />, document.getElementById('app'));

console.log(mockClient())