
let input = document.querySelector('input');
let button = document.querySelector('button');
let list = document.querySelector('ul');
const socket = new WebSocket('ws://localhost:5000');

socket.addEventListener('open', (e) => {
  socket.send('to da server')
})

socket.addEventListener('message', (e) => {
  console.log('Message from the server: ', e.data)
})

button.addEventListener('click', (e) => {

})
