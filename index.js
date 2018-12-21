//helper functions
const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const findDistance = (obj1, obj2) => {
  let distance = Math.sqrt((Math.pow(obj1.posXY[0] - obj2.posXY[0], 2)) + (Math.pow(obj1.posXY[1] - obj2.posXY[1], 2)));
  return distance;
}
const findRelativeVelocity = (obj1, obj2) => {
  let relativeVelocity = obj1.veloXY[0] - obj2.veloXY[0] + obj1.veloXY[1] - obj2.veloXY[1];
  if (relativeVelocity < 0) {
    relativeVelocity = -Math.sqrt((Math.pow(obj1.veloXY[0] - obj2.veloXY[0], 2)) + (Math.pow(obj1.veloXY[1] - obj2.veloXY[1], 2)));
  } else {
    relativeVelocity = Math.sqrt((Math.pow(obj1.veloXY[0] - obj2.veloXY[0], 2)) + (Math.pow(obj1.veloXY[1] - obj2.veloXY[1], 2)));
  }
  return relativeVelocity;
}
const resources = require('./resources')

const express = require("express");
const mongojs = require('mongojs');
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const path = require("path");
const db = mongojs('STAR_PLEBE');
const account = db.collection('account');

const SOCKET_LIST = {};
const PLAYER_LIST = {};
const dynamicObjArray = {
  ship: {
    pirate: {},
    raider: {},
    trader: {},
    police: {},
    miner: {},
  },
  bullet: {},
  asteroid: {},
  ore: {},
}

const staticObjArray = {
  spaceStations: {},
  stars: {},
}
const asteroidFields = [
  [150, 0, 1000, 7000, 0, 2000],
  [150, 600, 2000, 4000, 2000, 2000],
  [150, 1200, 2000, 3000, 4000, 6000],
  [150, 1800, 0, 2000, 6000, 4000],
  [150, 2400, 6000, 2000, 2000, 8000],
  [150, 3000, 8000, 2000, 3000, 6000]
]

http.listen(3001, () => {
  console.log('listening on *:3001');
});

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

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
  socket.on('playerAction', pack => {
    playerActionHandler(socket.id, pack)
  })

});

const loginHandler = (data, socket) => {
  if (!data.newAccount) {
    account.find({
      username: data.username
    }, (err, docs) => {
      if (!docs[0]) {
        io.to(data.id).emit('login validation', [false, 'no such user']);
        console.log('no such user')
      } else if (docs[0].password == data.password) {
        let player = generatePlayer(4700, 5300, data.id, 0, 0);
        PLAYER_LIST[data.id] = player;
        io.to(data.id).emit('login validation', [true, staticObjArray, PLAYER_LIST, dynamicObjArray]);
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
const positionUpdate = (pack) => {
  for (let i in SOCKET_LIST) {
    let socket = SOCKET_LIST[i];
    socket.emit('newPosition', pack);
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
const tradeHandler = (id, pack) => {
  let ore = pack[2]
  let player = PLAYER_LIST[id];
  let station = staticObjArray.spaceStations[pack[1]];
  switch (pack[0]) {
    case 'buy':
      {
        if (player.credits >= ore.value && station.oreStock[ore.name] > 0 && player.ship.cargo.length < player.ship.maxCargo) {
          player.credits -= ore.value;
          player.ship.cargo.push(new _ore(0, 0, `${ore.name}`, `ore${ore.name+Date.now()}`, resources.ores[ore.index]))
          station.oreStock[ore.name]--;
          player.updateTrade();
        }
      }
      break;
    case 'buyAll':
      {
        while (player.credits >= ore.value && station.oreStock[ore.name] > 0 && player.ship.cargo.length < player.ship.maxCargo) {
          player.credits -= ore.value;
          player.ship.cargo.push(new _ore(0, 0, `${ore.name}`, `ore${ore.name+Date.now()}`, resources.ores[ore.index]))
          station.oreStock[ore.name]--;
          player.updateTrade();
        }
      }
      break;
    case 'sell':
      {
        if (player.oreCount[ore.name] > 0) {
          player.credits += ore.value;
          for (let item in player.ship.cargo) {
            if (player.ship.cargo[item].type == ore.name) {
              player.ship.cargo.splice(item, 1);
              station.oreStock[ore.name]++;
              player.updateTrade();
              break;
            }
          }
        }
      }
      break;
    case 'sellAll':
      {
        while (player.oreCount[ore.name] > 0) {
          for (let item in player.ship.cargo) {
            if (player.ship.cargo[item].type == ore.name) {
              player.ship.cargo.splice(item, 1);
              station.oreStock[ore.name]++;
              player.credits += ore.value;
              player.oreCount[ore.name]--;
            }
          }
        }
        player.updateTrade();
      }
      break;
  }
}

const playerActionHandler = (id, pack) => {
  let player = PLAYER_LIST[id];
  let now = Date.now();
  if (pack[0] == 'buy' || pack[0] == 'buyAll' || pack[0] == 'sell' || pack[0] == 'sellAll') {
    tradeHandler(id, pack)
  }
  if (pack == 'undock') {
    player.leaveStation();
  }
  if (pack[87]) { //w
    player.acceleratePlayer(0.02);
  };
  if (pack[83]) { //s
    player.decceleratePlayer(0.02);
  };
  if (pack[65]) { //a

    player.angle -= 9;
  };
  if (pack[68]) { //d
    player.angle += 9;
  };
  if (pack[82]) { //r
    player.pickUpOre();
    player.enterStation();
  };
  if (pack[70]) { //f
    player.shootBullet(now);
  };
}

const asteroidCollision = (bulletArray, asteroidArray) => {
  for (let x in bulletArray) {
    for (let y in asteroidArray) {
      let target = asteroidArray[y];
      let bullet = bulletArray[x];
      let distance = findDistance(bullet, target);
      if (distance < target.width / 2 / target.numberOfFrames) {
        target.hull -= bullet.damage;
        removeObjUpdate(false, false, bulletArray[x]);
        delete bulletArray[x];
        if (target.hull <= 0) {
          target.spawnOres();
          removeObjUpdate(false, false, asteroidArray[y]);
          delete dynamicObjArray.asteroid[y];
        }
        break;
      }
    }
  }
}
const shipCollision = (bulletArray, targetArray) => {
  for (let x in bulletArray) {
    for (let ship in targetArray) {
      let target = targetArray[ship];
      let bullet = bulletArray[x];
      if (target.active && bullet.owner != target && (bullet.owner.type != target.type || target.type == 'player')) {
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
   //         console.log(target.ship.shield, target.ship.hull)
            delete bulletArray[x];
          }
          if (target.ship.hull <= 0) {
            if (target.type == 'player') {
              target.ship.hull = 200;
              target.ship.shield = 200;
              target.posXY = [4900 + ranN(200), 4900 + ranN(200)];
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
            if (target.type != 'player') {
              removeObjUpdate(false, false, targetArray[ship])
              delete targetArray[ship];
            }

          };
          break;
        }
      }
    }
  }
}


setInterval(function () {
  let now = Date.now();
  shipCollision(dynamicObjArray.bullet, PLAYER_LIST);
  for (type in dynamicObjArray.ship) {
    shipCollision(dynamicObjArray.bullet, dynamicObjArray.ship[type])
  }
  asteroidCollision(dynamicObjArray.bullet, dynamicObjArray.asteroid);
  let pack = [];
  for (let arr in dynamicObjArray) {
    for (let i in dynamicObjArray[arr]) {
      if (arr != 'ship') {
        let obj = dynamicObjArray[arr][i];
        obj.updatePosition(0.02);
        pack.push({
          type: obj.type,
          id: obj.id,
          x: obj.posXY[0],
          y: obj.posXY[1],
          angle: obj.angle,
        })
      } else {
        for (let arr2 in dynamicObjArray[arr]) {
          for (let i in dynamicObjArray[arr][arr2]) {
            let obj = dynamicObjArray[arr][arr2][i];
            obj.updatePosition(0.02);
            pack.push({

              type: obj.type,
              id: obj.id,
              x: obj.posXY[0],
              y: obj.posXY[1],
              angle: obj.angle,
            })
          }
        }
      }
    }
  }

  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];
    player.updatePlayer(0.02);

    pack.push({
      type: 'ship',
      energy:player.ship.energy,
      shield:player.ship.shield,
      hull:player.ship.hull,
      id: player.id,
      x: player.posXY[0],
      y: player.posXY[1],
      angle: player.angle
    });

  }
  positionUpdate(pack);
  pack = []
}, 1000 / 50);





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
    this.energy = 0;
    this.maxEnergy = ship.maxEnergy;
    this.shield = 0;
    this.maxShield = ship.maxShield;
    this.hull = ship.hull;
    this.maxHull = ship.maxHull;
    this.maxWeaponHardpoints = ship.maxWeaponHardpoints;
    this.weaponHardpoints = ship.weaponHardpoints;
    this.maxCargo = ship.maxCargo;
    this.cargo = [];
    this.value = ship.value;
  }
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
      case 'station':
        this.station = this.sprite;
        this.mapImg = this.sprite.mapImg;

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
  updateTrade() {
    let pack = [];
    this.oreCounter();
    pack.push(this.id, this.oreCount, this.credits, this.ship.cargo);
    for (let stat in staticObjArray.spaceStations) {
      let station = staticObjArray.spaceStations[stat];
      //   console.log(station)
      pack.push([station.oreStock, station.id])
    }
    io.emit('trade update', pack);
    pack = [];
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
    }
    if (this.ship.energy < this.ship.maxEnergy) {
      this.ship.energy++;
    }
  }
  pickUpOre() {
    for (const ore in dynamicObjArray.ore) {
      console.log('trying to pick up ore')
      let oreArray = dynamicObjArray.ore;
      if (this.posXY[0] >= oreArray[ore].posXY[0] - 50 &&
        this.posXY[0] <= oreArray[ore].posXY[0] + 50 &&
        this.posXY[1] >= oreArray[ore].posXY[1] - 50 &&
        this.posXY[1] <= oreArray[ore].posXY[1] + 50
      ) {
        if (this.ship.cargo.length < this.ship.maxCargo) {
          this.ship.cargo.push(oreArray[ore]);
          this.oreCounter();
          io.to(`${this.id}`).emit('oreCountUpdate', this.oreCount);
          removeObjUpdate(false, false, oreArray[ore])
          delete dynamicObjArray.ore[ore];
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
    for (let obj in staticObjArray.spaceStations) {
      let station = staticObjArray.spaceStations[obj];
      let distance = findDistance(this, station);
      let relativeVelocity = Math.abs(findRelativeVelocity(this, station));
      if (relativeVelocity < 30) {
        if (distance < 120) {
          this.active = false;
          this.veloXY = [0, 0];
          io.emit('docked', [this.id, station.id])
        }
      }
    }
  };
  leaveStation() {
    this.active = true;
    io.emit('undocked', this.id)

  }
}
class _asteroid extends _gameObject {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
    this.ores = this.asteroid.ores;
    this.hull = this.asteroid.hull;
  }

  spawnOres() {
    for (let index in this.ores) {
      let num = ranN(2);
      if (num == 1) {
        let ore = new _ore(this.posXY[0], this.posXY[1], `${resources.ores[this.ores[index]].name}`, `${resources.ores[this.ores[index]].name+Date.now()+ranN(100000)}`, resources.ores[this.ores[index]]);
        ore.angle = ranN(360);
        ore.veloXY[0] = Math.sin(toRad(ore.angle)) * ranN(100) / 10;
        ore.veloXY[1] = Math.cos(toRad(ore.angle)) * ranN(100) / 10;
        dynamicObjArray['ore'][ore.id] = ore;
        addObjUpdate(false, false, ore)
        setTimeout(function () {
          if (dynamicObjArray['ore'][ore.id]) {
            removeObjUpdate(false, false, dynamicObjArray.ore[ore.id])
            delete dynamicObjArray['ore'][ore.id];
          }
        }, 10000 + ranN(3000))
      }
    }
  };
}
class _ore extends _gameObject {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
  }
}

class _star extends _gameObject {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
  }
}
class _spaceStation extends _gameObject {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
    this.oreStock = {
      iron: 100,
      copper: 100,
      uranium: 100,
      gold: 100
    }
  }
}
const generateStars = (num) => {
  for (let i = 0; i < num; i++) {
    let star = new _star(ranN(10800) - 400, ranN(10800) - 400, 'star', `${i}`, resources.stars[ranN(7)]);
    staticObjArray.stars[star.id] = star;
  }
}
const generateAsteroids = (num, id, posX, width, posY, height) => {
  for (let i = 0; i < num; i++) {
    let asteroid = new _asteroid(posX + ranN(width), posY + ranN(height), 'asteroid', `asteroid${id+i}`, resources.asteroids[ranN(3)])
    dynamicObjArray.asteroid[asteroid.id] = asteroid;
  }

}
const generatePlayer = (x, y, id, shipId, weaponId) => {
  let player = new _player(x, y, 'player', id, new _ship(resources.ships[shipId]));
  player.credits = 10000;
  player.ship.weaponHardpoints[0] = resources.weapons[weaponId];
  player.ship.weaponHardpoints[0].bullet = resources.bullets[weaponId];
  return player;
}
const generateStation = (x, y, id) => {
  let station = new _spaceStation(x, y, 'station', resources.spaceStations[id].name, resources.spaceStations[id])
  staticObjArray.spaceStations[station.id] = station;
}



// game data creation from ./entity-generation++
for (let field in asteroidFields) {
  generateAsteroids(asteroidFields[field][0], asteroidFields[field][1], asteroidFields[field][2], asteroidFields[field][3], asteroidFields[field][4], asteroidFields[field][5])
};
generateStation(4700, 5200, 1);
generateStation(3300, 3300, 2);
generateStation(7700, 7700, 0);

generateStars(3000);