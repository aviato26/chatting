import React from 'react';
import { Link } from 'react-router-dom';
import './talkboxstyles.css'

let Signup = (props) => {

  let name = null;
  let email = null;
  let password = null;
  let image = null;
  let reader = new FileReader();

let CreateUser = (e) => {

      e.preventDefault();

        reader.onload = () => {
          sessionStorage.img = reader.result
        }

        if(sessionStorage.img == ''){
          reader.readAsDataURL(image.files[0])
        } else {
          sessionStorage.img = ''
        }

        fetch('/signup', {
          method: "POST",
          headers: {
            "Accept": "application/json, text/plain",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name.value,
            email: email.value,
            password: password.value,
            active: true
          })
        })
        .then(data => {
          return data.json()
        })
        .then(res => {
          if(!!res.id){
            sessionStorage.id = res.id
            props.history.replace('/home')
          } else {
            console.log('form is invalid')
          }
        })
        .catch(err => console.log(err))
        e.target.reset();
    }

/*
this is the banner sign but taking it down for now for a cleaner design

    <h1 data-text="SignUp" className='glow'>
        SignUp
    </h1>
*/

  return(
    <div className='grid-container signup'>
      <div className='grid-item'>
        <p className='intro'>once logged in this app will show you everyone logged in within a hundred feet</p>
        <p className='intro'>click on the desired user to chat with them</p>
        <p className='intro'>if the other user accepts you will be redirected to the private chat room</p>
      </div>
      <div className='grid-item form'>
      <h1 style={{color: 'white'}}>Sign Up</h1>
        <form onSubmit={CreateUser}>
          <div className='signupInputs'>
            <input placeholder='Enter Name' ref={(text) => {name = text}} required></input>
          </div>
          <div className='signupInputs'>
            <input placeholder='Email' ref={(text) => {email = text}} required></input>
          </div>
          <div className='signupInputs'>
            <input placeholder='Password' ref={(text) => {password = text}} required></input>
          </div>
          <div className='signupInputs'>
            <input placeholder="Picture" style={{width: '90%'}} placeholder='Picture' type='file' ref={(img) => {image = img}}/>
          </div>
            <button>Send</button>
        </form>
        <Link to='login'><button>Log In</button></Link>
        </div>
    </div>
  )
}

export default Signup;
