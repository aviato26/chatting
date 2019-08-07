import React, { Component } from 'react';
import Signup from './components/signup.js';
import Login from './components/login.js';
import TalkBox from './components/list.js';
import {BrowserRouter, Route, Redirect} from 'react-router-dom';
import Home from './components/home.js';
import './App.css';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      socket: null
    }
  }

componentDidMount(){
  let socketObj = new WebSocket('ws://localhost:5001');

  socketObj.addEventListener('open', (e) => {
    this.setState({
      socket: socketObj
    })
  })
}


  render() {
    return (
      <BrowserRouter>
        <div>
          <Route exact path='/' component={Signup} />
          <Route exact path='/home' render={() => <Home socket={this.state.socket} />} />
          <Route exact path='/login' component={Login} />
          <Route exact path='/message' render={() => <TalkBox socket={this.state.socket} />} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
