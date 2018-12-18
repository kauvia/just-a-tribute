const express = require("express");
const mongojs = require('mongojs');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const path = require("path");

const db = mongojs('STAR_PLEBE');
const account = db.collection('account');

const resources = require('./resources');
//helper functions
const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const findDistance = (obj1, obj2) => {
    let distance = Math.sqrt((Math.pow(obj1.posXY[0] - obj2.posXY[0], 2)) + (Math.pow(obj1.posXY[1] - obj2.posXY[1], 2)));
    return distance;
}

http.listen(3001, () => {
  console.log('listening on *:3001');
});

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});


const loginHandler = data => {
  if (!data.newAccount) {
    account.find({
      username: data.username
    }, (err, docs) => {
      if (!docs[0]) {
        io.emit('login validation', [false, 'no such user']);
        console.log('no such user')
      } else if (docs[0].password == data.password) {
        io.emit('login validation', [true, staticObjArray]);
      } else {
        io.emit('login validation', [false, 'wrong password']);
        console.log('wrong password')
      }
    })
  } else {
    account.find({
      username: data.username
    }, (err, docs) => {
      if (docs[0]) {
        io.emit('login validation', [false, 'username already taken']);
        console.log('username already taken')
      } else if (data.password.length >= 8) {
        account.insert({
          username: data.username,
          password: data.password
        });
        io.emit('login validation', [true, {
          playyername: data.username, // DUMMY VALUES
          posxy: [212, 312], // FOR TESTING
          ship: {
            name: 'mars',
            speed: 5 // PURPOSES
          }
        }]);
      } else {
        io.emit('login validation', [false, 'password too short']);
        console.log('password too short')
      }
    })
  }
}



let SOCKET_LIST = {};
io.on('connection', socket => {
  console.log('a user connected');
  socket.id = Math.random();
  SOCKET_LIST[socket.id]=socket;
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('login information', data => {
    loginHandler(data);
  });
});

setInterval(function(){
  let pack = [];

})



// game data
const asteroidFields = [
  [150, 0, 1000, 7000, 0, 2000],
  [150, 600, 2000, 4000, 2000, 2000],
  [150, 1200, 2000, 3000, 4000, 6000],
  [150, 1800, 0, 2000, 6000, 4000],
  [150, 2400, 6000, 2000, 2000, 8000],
  [150, 3000, 8000, 2000, 3000, 6000]
]

let dynamicObjArray = {
  pirate: {},
  raider: {},
  trader: {},
  police: {},
  miner: {},
  bullet: {},
  player: {},
  asteroid: {},
  ore: {},
}

const staticObjArray = {
  spaceStations: {},
  stars: {},
}

class _gameObject {
  constructor(posX, posY, type, id, sprite, dispXY = [0, 0], veloXY = [0, 0], angle = 360) {
      this.posXY = [posX, posY];
      this.type = type;
      this.id = id;
      this.sprite = sprite;
      this.width = this.sprite.width;
      this.height = this.sprite.height;
      this.ticksPerFrame = this.sprite.ticksPerFrame;
      this.numberOfFrames = this.sprite.numberOfFrames;
      this.active = true;
      this.isPlayer = false;

      switch (this.type) {
          case 'player':
              this.ship = this.sprite;
              break;
          case 'pirate':
              this.ship = this.sprite;
              break;
          case 'trader':
              this.ship = this.sprite;
              break;
          case 'raider':
              this.ship = this.sprite;
              break;
          case 'police':
              this.ship = this.sprite;
              break;
          case 'bullet':
              this.bullet = this.sprite;
              break;
          case 'asteroid':
              this.asteroid = this.sprite;
              break;
      }
      this.veloXY = veloXY;
      this.angle = angle;
      this.dispXY = dispXY;

      this.frameIndex = 0;
      this.tickCount = 1;
      this.sprite = this.sprite.img;
  }

  updatePosition(dt) {
      this.posXY[0] += this.veloXY[0] * dt;
      this.posXY[1] -= this.veloXY[1] * dt;
  }
}

class _star extends _gameObject {
  constructor(posX, posY, type, id, sprite) {
      super(posX, posY, type, id, sprite);
  }
}
const generateStars = (num, array) => {
  for (let i = 0; i < num; i++) {
      let star = new _star(ranN(10800) - 400, ranN(10800) - 400, 'star', `${i}`, resources.stars[ranN(7)]);
      array[star.id]=star;
  }
}


generateStars(3000, staticObjArray['stars']);
console.log(staticObjArray['stars'])