const express = require("express");
const mongojs = require('mongojs');

const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const path = require("path");

const db = mongojs('STAR_PLEBE');
const account = db.collection('account');



http.listen(3001, () => {
  console.log('listening on *:3001');
});

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

io.on('connection', socket => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('login information', data => {
    loginHandler(data);
  });
});



const loginHandler = data => {
  if (!data.newAccount) {
    account.find({
      username: data.username
    }, (err, docs) => {
      if (!docs[0]) {
        io.emit('login validation', [false,'no such user']);
        console.log('no such user')
      } else if (docs[0].password == data.password) {
        io.emit('login validation', [true,{
          playyername: data.username, // DUMMY VALUES
          posxy: [212, 312], // FOR TESTING
          ship: {
            name: 'mars',
            speed: 5 // PURPOSES
          }
        }]);
      } else {
        io.emit('login validation', [false,'wrong password']);
        console.log('wrong password')
      }
    })
  } else {
    account.find({username: data.username}, (err,docs)=>{
      if (docs[0]){
        io.emit('login validation', [false,'username already taken']);
        console.log('username already taken')
      } else if (data.password.length >= 8){
        account.insert({username:data.username, password:data.password});
        io.emit('login validation', [true,{
          playyername: data.username, // DUMMY VALUES
          posxy: [212, 312], // FOR TESTING
          ship: {
            name: 'mars',
            speed: 5 // PURPOSES
          }
        }]);
      } else {
        io.emit('login validation', [false,'password too short']);
        console.log('password too short')
      }
    })
  }
}