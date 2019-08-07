import React from 'react';
import { Link } from 'react-router-dom';
import './talkboxstyles.css'

let Login = (props) => {

  let email = null;
  let password = null;

let GetUser = (e) => {
      e.preventDefault();

        fetch('/login', {
          method: "POST",
          headers: {
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email.value,
            password: password.value,
          })
        })
        .then(data => {
          return data.json()
        })
        .then(res => {
          if(!!res.id){
            sessionStorage.id = res.id;
            sessionStorage.name = res.name;
            props.history.replace('/home')
          } else {
            console.log('form is invalid')
          }
        })
        .catch(err => console.log(err))
        e.target.reset();
    }

/*
taking banner design for cleaner design
    <div>
      <h1 className='glow'>Log In</h1>
    </div>
*/
  return(
    <div className='grid-container login' style={{display: 'block'}}>
      <div className='loginForm'>
      <h1 style={{color: 'white'}}>Log In</h1>
        <form onSubmit={GetUser}>
            <input placeholder='Email' ref={(text) => {email = text}} required></input>
            <input placeholder='Password' ref={(text) => {password = text}} required></input>
            <button>Start</button>
        </form>
        <Link to='/'><button>Sign Up</button></Link>
        </div>
    </div>
  )
}

export default Login;
