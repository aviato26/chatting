
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const parser = require('body-parser');
let port = process.env.PORT || 5000;
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 5001});
const con = require('./config.js');

app.use(parser());

app.use((req, res, next) => {
  // settings for CORS acceptance
 res.header("Access-Control-Allow-Origin", "http://localhost:3000");
 res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
 res.header("Access-Control-Allow-Credentials", true)
  next();
})


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");

  const table = "CREATE TABLE IF NOT EXISTS Users (`id` INTEGER NOT NULL auto_increment , `name` VARCHAR(255), `email` VARCHAR(255), `password` VARCHAR(255), `active` TINYINT(1), `latitude` FLOAT, `longitude` FLOAT, `socketId` VARCHAR(255), `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL, PRIMARY KEY (`id`))";
  let userData = "INSERT INTO Users (name, email, password, active, latitude, longitude, socketId) VALUES ('Sam', 'sam@sam.com', 'sam', 'true', 33.690183133249874, -118.00896763801576, '12344321')";
  let authenticate = "SELECT * FROM Users WHERE email = ? AND password = ?";

  con.query(table, function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
/*
  con.query("SELECT * FROM Users", function (err, result, fields) {
  if (err) throw err;
  console.log(result);
  });

  con.query(authenticate, ['sam@sam.com', 'sam'], function(err, res){
    if(err) throw err;
    console.log(res)
  })
*/
});


app.post('/signup', (req, res) => {
  let createUser = `INSERT IGNORE INTO Users (name, email, password, active, latitude, longitude, socketId) VALUES ('${req.body.name}', '${req.body.email}', '${req.body.password}', '${req.body.active}', 33.690183133249874, -118.00896763801576, '')`;

  con.query(createUser, function (err, result) {
  if (err) throw err;
    console.log(result);
    let user = {id: result.inserId};
    res.send(user);
  });

});


app.post('/login', (req, res) => {
  let authenticate = "SELECT * FROM Users WHERE email = ? AND password = ?";

  let searchDB = new Promise(function(resolve, rej){
    con.query(authenticate, [`${req.body.email}`, `${req.body.password}`], function(err, user){
      if(err) throw(err);
        if(user.length > 0){
          resolve(user)
        }
        else {
          rej('sorry there is no match for this person')
        }
    })
  })
  /*
  users.findAll({
    where: {
      email: req.body.email,
      password: req.body.password
    }

  })
*/
  .then(data => {
    let user = {id: data[0].id, name: data[0].name}
      res.send(user)
  })
  .catch(err => res.send(err))
})


app.post('/userData', (req, res) => {
  let findUser = "SELECT * FROM Users WHERE id = ?";

  let searchDB = new Promise(function(resolve, rej){
    con.query(findUser, `${req.body.id}`, function(err, user){
      if(err) throw(err);
        if(user.length > 0){
          resolve(user)
        }
        else {
          rej('sorry there is no match for this person')
        }
    })
  })
  .then(user => {
    let userFound = `UPDATE Users SET latitude = ${req.body.lat}, longitude = ${req.body.long} WHERE id = ${user[0].id}`;
    con.query(userFound, function(err, updatedUser){
            if(err) throw err;
            console.log(updatedUser)
    })
  })
  .catch(err => res.send(err))

  // using sequelize to update users location every 5 seconds

  let nearbyUsers = new Promise(function(resolve, rej){
    con.query("SELECT * FROM Users", function (err, result) {
    if (err) throw err;
      resolve(result)
    });
  })
  .then(data => {
    return new Array(...data).filter(c => {
      return (c.id !== parseInt(req.body.id)) && ((c.latitude - req.body.lat) < 0.000277 || (-c.latitude - -req.body.lat) < 0.000277) && ((c.longitude - req.body.long) < 0.000277 || (-c.longitude - -req.body.long) < 0.000277) && (c.latitude !== null && c.longitude !== null)
    })
  })
  // send the filtered data back to client side
  .then(data => {
    res.send(data)
  })
  .catch(data => console.log(data))
/*
  users.findByPk(req.body.id)
  .then(data => {
    data.update({
      latitude: req.body.lat,
      longitude: req.body.long
    })
    .catch(err => res.send(err))
  })
  users.findAll()
  // this is checking the users lat and long to see if any other users are near by (this should be about a 100ft radius)

  .then(data => {
    return new Array(...data).filter(c => {
      return (c.id !== parseInt(req.body.id)) && ((c.latitude - req.body.lat) < 0.000277 || (-c.latitude - -req.body.lat) < 0.000277) && ((c.longitude - req.body.long) < 0.000277 || (-c.longitude - -req.body.long) < 0.000277) && (c.latitude !== null && c.longitude !== null)
    })
  })
  // send the filtered data back to client side
  .then(data => {
    res.send(data)
  })
  .catch(data => console.log(data))
  */
})

// setting up web socket connection

/*
let users = [];

wss.on('connection', function connection(ws) {
  console.log('socket server up and running')
  let parser;

  users.push(ws);
//console.log(users.length)

  ws.on('message', function incoming(mes) {
    console.log(mes);
  });


  if(users.length > 2){
    users[1].send('hello #1')
  }

});
*/

/*
  socket.on('connection', (client) => {
// updating client id to db everytime user logs in
  console.log('connected')
  //user[`${msg.id}`] = client.id

  client.on('accepted', (msg) => {
    users.findByPk(msg.sendTo)
    .then(data => {
      socket.to(data.socketId).emit('accepted', { answer: msg.answer})
    })
  })

  client.on('greet', (msg) => {
    console.log(msg)
    users.findByPk(msg.chatWith)
    .then(data => {
      socket.to(data.socketId).emit('converse', { greet: `${msg.talkingTo} wants to talk, would you like to chat`, otherId: msg.chatWith, id: msg.id})
    })
  })

    client.on('setuserid', (msg) => {
     users.findByPk(msg.id)
      .then(data => {
        data.update({
          socketId: client.id
        })
      })
      .catch(err => console.log(err))
    })

// uses sequelize to find the other user by there id and sending there message along

    client.on('private message', (msg) => {
      users.findByPk(msg.otherUserId)
        .then(data => {
          socket.to(data.socketId).emit('output', msg)
        })
          //socket.to(`${user[`${msg.otherUserId}`]}`).emit('output', msg)
      })

  })

// setup for heroku, basically telling heroku in production use the react build folder for UI

  if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client-side/build'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client-side', 'build', 'index.html'))
    })
  }
*/

app.listen(port, console.log('server running'))
