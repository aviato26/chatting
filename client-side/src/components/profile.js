import React from 'react';
import './talkboxstyles.css';

let Profile = (props) => {
  return(
    <div className='flex-container'>
      {
        props.userName.map((c,i) => {
        return <div onClick={props.talkbox} key={i} className='talkbox grid-item'>
                  <img src={localStorage.img}/>
                  <p>{c.name}</p>
               </div>
        })
      }
    </div>
  )
}

export default Profile
