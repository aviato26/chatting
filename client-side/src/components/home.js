import React from 'react';
import Profile from './profile.js';
import { Redirect } from 'react-router-dom';
import './talkboxstyles.css';


class Home extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      names: [],
      otherUserId: undefined,
      text: '',
      chatWith: '',
      talkingTo: null,
      stopTracking: null,
      switchToChat: false,
      hideGreeting: 'talk'
    }
  }


  componentDidMount(){

    let location;

    let options = {
      enableHighAccuracy: false,
      timeout: 50000
    }

    if(sessionStorage.id){

      this.props.socket.send(JSON.stringify({id: sessionStorage.id}))

      location = navigator.geolocation.watchPosition((pos) => {
        fetch('/userData', {
          method: "POST",
          headers: {
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
              id: sessionStorage.id,
              lat: pos.coords.latitude,
              long: pos.coords.longitude
          })
        })
        .then(data => data.json())
        .then(res => {
          this.setState({
              names: res.map(c => {
                return {
                id: c.id,
                name: c.name
              }
            })
          })
        })
        .catch(err => console.log(err))
      }, (err) => console.log(err), options)
      this.setState({
        stopTracking: location
      })
    }
  }

  getSnapshotBeforeUpdate(props, state){
    if(state.chatWith === ''){
      return this.state.chatWith
    } else if(state.switchToChat === false){
      return this.state.switchToChat
    }
    return null
  }

  componentDidUpdate(props, state, snapshot){
    // must check for state text or will emit to socket multiple times
    if(snapshot !== null){
      // must use once on socket instead of on or the messages will emit several times
      this.props.socket.send('message', (data) => {
        this.setState({
          chatWith: data.greet
        })
        sessionStorage.interaction = data.id
        this.setState({
          hideGreeting: 'talking'
        })
      })

      this.props.socket.send('accepted', (data) => {
        this.setState({
          switchToChat: data.answer
        })
      })
    }
  }

  componentWillUnmount(){
    navigator.geolocation.clearWatch(this.state.stopTracking);
  }

activeTalk = (e) => {
  // filter all people logged in and set there ids in state
  this.setState({
    otherUserId: this.state.names.filter(c => e.target.textContent === c.name)
  })

  let textContent = e.target.textContent

/*
  webConnection having trouble connecting so after user clicks on the desired user
  to talk to the promise will be set to see if there user id is set in state if not
  error will be logged out
*/

  let gettingUserId = new Promise((res, rej) => {
    if(this.state.otherUserId !== undefined && this.state.otherUserId.length > 0){
      res(this.state.otherUserId);
    } else {
      rej(Error('it seems there was no connection or the connection was broken'));
    }
  })

  gettingUserId.then((res) => {
    console.log(res)
    sessionStorage.interaction = res[0].id;
    sessionStorage.talkingTo = textContent;
    this.props.socket.send('greet', {
      chatWith: sessionStorage.interaction,
      id: sessionStorage.id,
      talkingTo: sessionStorage.name
    })
  },
  (err) => {
    console.log(err);
  })
}

goToChatRoom = () => {
  this.setState({
    switchToChat: true
  })
  this.props.socket.send('accepted', {
    answer: true,
    sendTo: sessionStorage.interaction
  })
}

denyChat = () => {
  this.setState({
    hideGreeting: 'talk'
  })
}

  render(){
    if(this.state.switchToChat){
      return <Redirect to='/message' />
    }
    return(
      <div className='grid-container'>
        <h1 className="victory"><span className="victory-v">T</span>alkBox</h1>
        <Profile userName={this.state.names} talkbox={this.activeTalk} />
        <div className={this.state.hideGreeting}>
          <p>{this.state.chatWith}</p>
          <button className='acceptButton' onClick={this.goToChatRoom}>Yes</button>
          <button className='acceptButton' onClick={this.denyChat}>No</button>
        </div>
      </div>
      )
  }
}

export default Home;
