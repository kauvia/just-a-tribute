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

let SOCKET_LIST = {};
let PLAYER_LIST = {};

const loginHandler = (data, socket) => {
  if (!data.newAccount) {
    account.find({
      username: data.username
    }, (err, docs) => {
      if (!docs[0]) {
        io.to(data.id).emit('login validation', [false, 'no such user']);
        console.log('no such user')
      } else if (docs[0].password == data.password) {
        let player = new _player(4800 + ranN(200), 4800 + ranN(200), 'player', data.id, new _ship(resources.ships[0]))
        player.ship.weaponHardpoints[0] = resources.weapons[0];
        player.ship.weaponHardpoints[0].bullet = resources.bullets[0];
        PLAYER_LIST[data.id] = player;
        io.to(data.id).emit('login validation', [true, staticObjArray, PLAYER_LIST]);
        //   socket.broadcast.emit('newPlayer', player);
        addObjUpdate(true, socket, player);
      } else {
        io.to(data.id).emit('login validation', [false, 'wrong password']);
        console.log('wrong password')
      }
    })
  } else {
    account.find({
      username: data.username
    }, (err, docs) => {
      if (docs[0]) {
        io.to(data.id).emit('login validation', [false, 'username already taken']);
        console.log('username already taken')
      } else if (data.password.length >= 8) {
        account.insert({
          username: data.username,
          password: data.password
        });
        io.to(data.id).emit('login validation', [true, {
          playyername: data.username, // DUMMY VALUES
          posxy: [212, 312], // FOR TESTING
          ship: {
            name: 'mars',
            speed: 5 // PURPOSES
          }
        }]);
      } else {
        io.to(data.id).emit('login validation', [false, 'password too short']);
        console.log('password too short')
      }
    })
  }
}
const addObjUpdate = (isBroadcast, sock, obj) => {
  if (sock) {
    isBroadcast ? sock.broadcast.emit('addObj', obj) :
      sock.emit('addObj', obj);
  } else {
    for (let i in SOCKET_LIST) {
      SOCKET_LIST[i].emit('addObj', obj)
    }
  }
}
const removeObjUpdate = (isBroadcast, sock, obj) => {
  if (sock) {
    isBroadcast ? sock.broadcast.emit('removeObj', obj) :
      sock.emit('removeObj', obj);
  } else {
    for (let i in SOCKET_LIST) {
      SOCKET_LIST[i].emit('removeObj', obj)
    }
  }
}
io.on('connection', socket => {
  SOCKET_LIST[socket.id] = socket;

  socket.on('disconnect', () => {
    if (PLAYER_LIST[socket.id]) {
      removeObjUpdate(true, socket, PLAYER_LIST[socket.id]);
    }
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];
  });
  socket.on('login information', data => {
    loginHandler(data, socket);
  });
  socket.on('playerAction', pack => playerActionHandler(socket.id, pack))

});


const playerActionHandler = (id, pack) => {
  let player = PLAYER_LIST[id];
  let now = Date.now();

  if (pack[87]) { //w
    player.acceleratePlayer(0.02);
    //         player.acceleratePlayer(dt);
  };
  if (pack[83]) { //s
    player.decceleratePlayer(0.02);

    //           player.decceleratePlayer(dt);
  };
  if (pack[65]) { //a

    player.angle -= 9;
  };
  if (pack[68]) { //d
    player.angle += 9;
  };
  if (pack[82]) { //r
    //          player.pickUpOre();
    //           player.enterStation();
  };
  if (pack[70]) { //f
    player.shootBullet(now);
  };
}

setInterval(function () {
  // for (let player in PLAYER_LIST) {
  //   console.log(PLAYER_LIST[player].ship.energy)
  // }
  let now = Date.now();
  collisionDetection(dynamicObjArray['bullet'], PLAYER_LIST)
  let pack = [];
  for (let i in dynamicObjArray['bullet']) {
    let bullet = dynamicObjArray['bullet'][i];
    bullet.updatePosition(0.02);
    pack.push({
      id: bullet.id,
      x: bullet.posXY[0],
      y: bullet.posXY[1],
      angle: bullet.angle,
    })
  }
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];
    player.updatePlayer(0.02);
    pack.push({
      id: player.id,
      x: player.posXY[0],
      y: player.posXY[1],
      angle: player.angle
    });
  }
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit('newPosition', pack);
  }
  pack = []
}, 1000 / 50);



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
  constructor(posX, posY, type, id, sprite, dispXY = [300, 300], veloXY = [0, 0], angle = 360) {
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
class _bullet extends _gameObject {
  constructor(posX, posY, type, id, sprite, dispXY, veloXY, angle) {
    super(posX, posY, type, id, sprite, dispXY, veloXY, angle);
    this.damage = this.bullet.damage;
    this.owner = this.owner;
  }
}
class _player extends _gameObject {
  constructor(posX, posY, type, id, sprite, dispXY) {
    super(posX, posY, type, id, sprite, dispXY);
    this.timeFiredBullet = [];
    for (let i = 0; i < this.ship.maxWeaponHardpoints; i++) {
      this.timeFiredBullet.push(Date.now());
    };
    this.credits = 0;
    this.karma = 0;
    this.oreCount = {
      iron: 0,
      copper: 0,
      uranium: 0,
      gold: 0,
    };
  }
  updatePlayer(dt) {
    if (this.angle != 360) {
      this.angle = Math.abs(this.angle % 360);
    }
    if (this.angle == 0) {
      this.angle = 360
    }

    let speed = Math.sqrt(this.veloXY[0] * this.veloXY[0] + this.veloXY[1] * this.veloXY[1]);
    let angle = Math.atan2(this.veloXY[1], this.veloXY[0]);
    if (speed > this.ship.maxSpeed) {
      let friction = 12.5;
      if (speed > friction) {
        speed -= friction
      };
    }
    this.veloXY[0] = Math.cos(angle) * speed;
    this.veloXY[1] = Math.sin(angle) * speed;
    this.posXY[0] += this.veloXY[0] * dt;
    this.posXY[1] -= this.veloXY[1] * dt;


    this.rechargeEnergyShield(dt);
    if (this.karma > 0) {
      this.karma -= dt;
    }
  }
  // shipExhaust() {
  //     let exhaust1 = new _exhaust(this.posXY[0] - 10 * Math.sin(toRad(this.angle)), this.posXY[1] + 10 * Math.cos(toRad(this.angle)), 'exhaust', `exhaust${Object.keys(exhaustArray).length+gameTime}`, exhausts[0]);
  //     exhaustArray[exhaust1.id] = exhaust1;
  // }
  acceleratePlayer(dt) {
    this.veloXY[0] += Math.sin(toRad(this.angle)) * this.ship.accel * dt;
    this.veloXY[1] += Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    //      this.shipExhaust();
  }
  decceleratePlayer(dt) {
    this.veloXY[0] -= Math.sin(toRad(this.angle)) * this.ship.accel * dt;
    this.veloXY[1] -= Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    //     this.shipExhaust();

  }
  shootBullet(now) {
    if (this.ship.energy >= this.ship.weaponHardpoints[0].energyUsage) {
      if (now - this.timeFiredBullet[0] > this.ship.weaponHardpoints[0].rateOfFire) {
        this.ship.energy -= this.ship.weaponHardpoints[0].energyUsage;
        this.timeFiredBullet[0] = Date.now();
        let bullet = new _bullet(this.posXY[0], this.posXY[1], 'bullet', `bullet${this.id+now}`, this.ship.weaponHardpoints[0].bullet, [], [], this.angle);
        bullet.owner = this;
        bullet.veloXY[0] = this.veloXY[0] + Math.sin(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
        bullet.veloXY[1] = this.veloXY[1] + Math.cos(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
        dynamicObjArray['bullet'][bullet.id] = bullet;
        addObjUpdate(false, false, bullet);
        setTimeout(function () {
          if (dynamicObjArray['bullet'][bullet.id]) {
            removeObjUpdate(false, false, dynamicObjArray['bullet'][bullet.id]);
            dynamicObjArray['bullet'][bullet.id];
            delete dynamicObjArray['bullet'][bullet.id];
          }
        }, this.ship.weaponHardpoints[0].dissipation)
      }

    }
  }
  rechargeEnergyShield(dt) {
    if (this.ship.shield < this.ship.maxShield) {
      this.ship.shield += dt * 10;
      console.log(this.ship.shield)
    }
    if (this.ship.energy < this.ship.maxEnergy) {
      this.ship.energy++;
    }
  }
  pickUpOre() {
    for (const ore in oreList) {
      if (player.posXY[0] >= oreList[ore].posXY[0] - 50 &&
        player.posXY[0] <= oreList[ore].posXY[0] + 50 &&
        player.posXY[1] >= oreList[ore].posXY[1] - 50 &&
        player.posXY[1] <= oreList[ore].posXY[1] + 50
      ) {
        if (player.ship.cargo.length < player.ship.maxCargo) {
          player.ship.cargo.push(oreList[ore]);
          delete oreList[ore];
          updateCreditCargoDisp();
        } else {
          console.log('cargo is full!!')
        }
      }

    }
  }
  oreCounter() {
    let oreCountTemp = {
      iron: 0,
      copper: 0,
      uranium: 0,
      gold: 0,
    }
    for (let ore in this.ship.cargo) {
      switch (this.ship.cargo[ore].type) {
        case 'iron':
          oreCountTemp.iron++;
          break;
        case 'copper':
          oreCountTemp.copper++;
          break;
        case 'uranium':
          oreCountTemp.uranium++;
          break;
        case 'gold':
          oreCountTemp.gold++;
          break;
      }
    }
    this.oreCount.iron = oreCountTemp.iron;
    this.oreCount.copper = oreCountTemp.copper;
    this.oreCount.uranium = oreCountTemp.uranium;
    this.oreCount.gold = oreCountTemp.gold;
  };
  enterStation() {
    for (let station in spaceStationArray) {
      let relativeVelocity = Math.abs(findRelativeVelocity(player, spaceStationArray[0]));
      if (relativeVelocity < 50) {
        if (player.posXY[0] >= spaceStationArray[station].posXY[0] - spaceStationArray[station].width / 2 &&
          player.posXY[0] <= spaceStationArray[station].posXY[0] + spaceStationArray[station].width / 2 &&
          player.posXY[1] >= spaceStationArray[station].posXY[1] - spaceStationArray[station].height / 2 &&
          player.posXY[1] <= spaceStationArray[station].posXY[1] + spaceStationArray[station].height / 2
        ) {
          dockedStation = spaceStationArray[station];
          for (let ore in oreTradeList) {
            oreTradeList[ore].updateStocks(dockedStation)
          }
          updateCreditCargoDisp();
          stationContainer.style.display = 'block';
          pauseGame();

        }
      }
    }
  };

}
class _star extends _gameObject {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
  }
}
class _ship {
  constructor(ship) {
    this.name = ship.name;
    this.img = ship.img;
    this.id = ship.id;
    this.width = ship.width;
    this.height = ship.height;
    this.numberOfFrames = ship.numberOfFrames;
    this.ticksPerFrame = ship.ticksPerFrame;
    this.maxSpeed = ship.maxSpeed;
    this.accel = ship.accel;
    this.energy = ship.energy;
    this.maxEnergy = ship.maxEnergy;
    this.shield = ship.shield;
    this.maxShield = ship.maxShield;
    this.hull = ship.hull;
    this.maxHull = ship.maxHull;
    this.maxWeaponHardpoints = ship.maxWeaponHardpoints;
    this.weaponHardpoints = ship.weaponHardpoints;
    this.maxCargo = ship.maxCargo;
    this.cargo = ship.cargo;
    this.value = ship.value;
  }
}

const generateStars = (num, array) => {
  for (let i = 0; i < num; i++) {
    let star = new _star(ranN(10800) - 400, ranN(10800) - 400, 'star', `${i}`, resources.stars[ranN(7)]);
    array[star.id] = star;
  }
}

const collisionDetection = (bulletArray, targetArray) => {
  for (let x in bulletArray) {
    for (let ship in targetArray) {
      let target = targetArray[ship];
      let bullet = bulletArray[x];
      if (bullet.owner != target && (bullet.owner.type != target.type || target.type == 'player')) {
        let distance = findDistance(bullet, target);
        if (distance < target.width / 2 / target.numberOfFrames) {
          if (target.ship.shield > bullet.damage) {
            target.ship.shield -= bullet.damage;
          } else if (target.ship.shield > 0) {
            let shieldPenetration = bullet.damage - target.ship.shield;
            target.ship.shield = 0;
            target.ship.hull -= shieldPenetration;
          } else {
            target.ship.hull -= bullet.damage;
          };
          if (bullet.bullet.name != 'c-beam') {
            removeObjUpdate(false, false, bulletArray[x])
            console.log(target.ship.shield, target.ship.hull)
            delete bulletArray[x];
          }
          if (target.ship.hull <= 0) {
            if (target.type == 'player') {
              io.to(`${target.id}`).emit('death', bullet.owner.id);
              console.log('a player died')
            }
            if (bullet.owner.type == 'player') {
              if (targetArray == dynamicObjArray['trader'] || targetArray == dynamicObjArray['police']) {
                console.log('u attked friendly ship');
                bullet.owner.karma += 100;
              } else if (targetArray == dynamicObjArray['pirate'] || targetArray == dynamicObjArray['raider']) {
                if (bullet.owner.karma > 50) {
                  bullet.owner.karma -= 50
                } else {
                  bullet.owner.karma = 0
                }
              }
            }
            removeObjUpdate(false, false, targetArray[ship])
            delete targetArray[ship];

          };
          break;
        }
      }
    }
  }
}
generateStars(3000, staticObjArray['stars']);