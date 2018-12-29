//helper functions
const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const findDistance = (obj1, obj2) => {
  let distance = Math.sqrt((Math.pow(obj1.posXY[0] - obj2.posXY[0], 2)) + (Math.pow(obj1.posXY[1] - obj2.posXY[1], 2)));
  return distance;
}
const findRelativeVelocity = (obj1, obj2 = {
  veloXY: [0, 0]
}) => {
  let relativeVelocity = obj1.veloXY[0] - obj2.veloXY[0] + obj1.veloXY[1] - obj2.veloXY[1];
  if (relativeVelocity < 0) {
    relativeVelocity = -Math.sqrt((Math.pow(obj1.veloXY[0] - obj2.veloXY[0], 2)) + (Math.pow(obj1.veloXY[1] - obj2.veloXY[1], 2)));
  } else {
    relativeVelocity = Math.sqrt((Math.pow(obj1.veloXY[0] - obj2.veloXY[0], 2)) + (Math.pow(obj1.veloXY[1] - obj2.veloXY[1], 2)));
  }
  return relativeVelocity;
}
const findAngle = (obj1, obj2) => {
  let angle = Math.atan2(obj2.posXY[1] - obj1.posXY[1], obj2.posXY[0] - obj1.posXY[0]);
  angle = angle * 180 / Math.PI;
  angle += 90;
  if (angle < 0) {
    angle += 360;
  }
  return angle
}
const ranKey = obj => {
  let keys = Object.keys(obj);
  return obj[keys[keys.length * Math.random() << 0]]
}

const resources = require('./resources')

const express = require("express");
const app = express();
const http = require('http').Server(app)
const io = require('socket.io')(http);
const path = require("path");
const mongodbURI = process.env.MONGOLAB_URI;
const mongojs = require('mongojs');
const db = mongojs(mongodbURI);
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
const badBoyArray = {};
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

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3001;
}
http.listen(port, () => {
  console.log(`listening on *:${port}`);
});

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

io.on('connection', socket => {
  SOCKET_LIST[socket.id] = socket;

  socket.on('disconnect', () => {
    if (PLAYER_LIST[socket.id]) {
      removeObjUpdate(false, false, PLAYER_LIST[socket.id]);
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
        let player = generatePlayer(2000, 8000, data.id, 0, 0);
        player.name = data.username;
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
        let player = generatePlayer(2000, 8000, data.id, 0, 0);
        player.name = data.username;
        PLAYER_LIST[data.id] = player;
        io.to(data.id).emit('login validation', [true, staticObjArray, PLAYER_LIST, dynamicObjArray]);
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
const chatUpdate = (id, msg, isTargeted = false, target = null) => {
  playerName = PLAYER_LIST[id].name;
  for (let i in SOCKET_LIST){
    SOCKET_LIST[i].emit('chat update',[playerName,msg])
  }
}
const chatHandler = (id, msg) => {
  chatUpdate(id,msg)
}
const tradeHandler = (id, pack) => {
  let player = PLAYER_LIST[id];
  let station = staticObjArray.spaceStations[pack[1]];

  switch (pack[3]) {
    case 'ore':
      {
        let ore = pack[2]
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
      break;
    case 'weapon':
      {
        let weapon = pack[2];
        switch (pack[0]) {
          case 'buy':
            {
              if (player.credits >= weapon.value && player.ship.weaponHardpoints.length < player.ship.maxWeaponHardpoints) {
                let position = player.ship.weaponHardpoints.length;
                player.ship.weaponHardpoints.push(resources.weapons[weapon.id])
                player.ship.weaponHardpoints[position]['bullet'] = resources.bullets[weapon.id]
                player.credits -= weapon.value;
                player.updateTrade();
              }
            }
            break;
          case 'sell':
            {
              for (let i in player.ship.weaponHardpoints) {
                let equipped = player.ship.weaponHardpoints[i];
                if (equipped.name == weapon.name) {
                  player.ship.weaponHardpoints.splice(i, 1);
                  player.credits += weapon.value;
                  player.updateTrade();
                  break;
                }
              }
            }
            break;
        }
      }
      break;
    case 'subsystem':
      {
        let subsystem = pack[2];
        switch (pack[0]) {
          case 'buy':
            {
              if (player.credits >= subsystem.value && player.ship.subsystems.length < player.ship.maxSubsystems) {
                player.ship.subsystems.push(resources.subsystems[subsystem.id])
                player.credits -= subsystem.value;
                player.updateShip();
                player.updateTrade();
              }
            }
            break;
          case 'sell':
            {
              for (let i in player.ship.subsystems) {
                let equipped = player.ship.subsystems[i];
                if (equipped.name == subsystem.name) {
                  player.ship.subsystems.splice(i, 1);
                  player.credits += subsystem.value;
                  player.updateShip();
                  player.updateTrade();
                  break;
                }
              }
            }
            break;
        }
      }
      break;
    case 'shipyard':
      {

      }
      break;
  }
}

const playerActionHandler = (id, pack) => {
  let player = PLAYER_LIST[id];
  let now = Date.now();
  if (pack[0] == 'chat') {
    chatHandler(id, pack[1]);
  }
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
  if (pack[69]) { //e
    player.pickUpOre();
    player.enterStation();
  }
  if (pack[82]) { //r
    player.shootBullet(now, 1);
  };
  if (pack[70]) { //f
    player.shootBullet(now, 0);
  };
  // if (!pack[87] && !pack[83]){
  // }
}
const visibleAsteroidArray = {};
const visibleAsteroid = () => {
  for (let i in dynamicObjArray.asteroid) {
    let asteroid = dynamicObjArray.asteroid[i];
    for (let j in PLAYER_LIST) {
      let player = PLAYER_LIST[j];
      let distance = findDistance(player, asteroid);
      if (distance < 1000) {
        visibleAsteroidArray[asteroid.id] = asteroid;
      }
    }
  }
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
          delete visibleAsteroidArray[y];
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
            if (!target.target && target.type != 'player') {
              target.target = bullet.owner;
            }
          } else {
            target.ship.hull -= bullet.damage;
          };
          if (bullet.bullet.name != 'c-beam') {
            removeObjUpdate(false, false, bulletArray[x])
            delete bulletArray[x];

          }
          if (target.ship.hull <= 0) {
            if (target.type == 'player') {
              if (bullet.owner.type != 'player') {
                bullet.owner.target = null
              }
              target.credits = 0;
              target.ship.hull = 200;
              target.ship.shield = 200;
              target.ship.subsystems = [];
              target.ship.cargo = [];
              target.posXY = [4900 + ranN(200), 4900 + ranN(200)];
              target.updateShip();
              target.updateTrade();
              io.to(`${target.id}`).emit('death', bullet.owner.id);
              console.log('a player died')
            }
            if (bullet.owner.type == 'player') {
              if (targetArray == dynamicObjArray.ship['trader'] || targetArray.ship == dynamicObjArray['police']) {
                console.log('u attked friendly ship');
                bullet.owner.karma += 250;
              } else if (targetArray == dynamicObjArray.ship['pirate'] || targetArray.ship == dynamicObjArray['raider']) {
                if (bullet.owner.karma > 100) {
                  bullet.owner.karma -= 100
                } else {
                  bullet.owner.karma = 0
                }
              }
            }
            if (target.type != 'player') {
              removeObjUpdate(false, false, targetArray[ship])
              delete targetArray[ship];
              console.log('dead npc ship')
            }

          };
          break;
        }
      }
    }
  }
}

let lastTime = Date.now();
setInterval(function () {
  let now = Date.now();
  let dt = (now - lastTime) / 1000;
  visibleAsteroid();
  shipCollision(dynamicObjArray.bullet, PLAYER_LIST);
  for (type in dynamicObjArray.ship) {
    shipCollision(dynamicObjArray.bullet, dynamicObjArray.ship[type])
  }
  asteroidCollision(dynamicObjArray.bullet, visibleAsteroidArray);
  let pack = [];
  for (let shipArr in dynamicObjArray.ship) {
    for (let x in dynamicObjArray.ship[shipArr]) {
      let ship = dynamicObjArray.ship[shipArr][x];
      ship.updateNpc(dt);
      pack.push({
        accel: ship.isAccel,
        active: ship.active,
        type: ship.type,
        id: ship.id,
        x: Math.floor(ship.posXY[0]),
        y: Math.floor(ship.posXY[1]),
        angle: Math.floor(ship.angle),
      })
      ship.isAccel = false
    }
  }
  badBoyFinder();
  for (let x in dynamicObjArray.bullet) {
    let bullet = dynamicObjArray.bullet[x];
    bullet.updatePosition(dt);
    pack.push({
      type: bullet.type,
      id: bullet.id,
      x: Math.floor(bullet.posXY[0]),
      y: Math.floor(bullet.posXY[1]),
      angle: Math.floor(bullet.angle),
    })
  }
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];
    player.updatePlayer(dt);

    pack.push({
      accel: player.isAccel,
      type: 'player',
      active: player.active,
      energy: Math.floor(player.ship.energy),
      shield: Math.floor(player.ship.shield),
      hull: Math.floor(player.ship.hull),
      id: player.id,
      x: Math.floor(player.posXY[0]),
      y: Math.floor(player.posXY[1]),
      angle: player.angle
    });
    player.isAccel = false;

  }
  positionUpdate(pack);
  pack = []
  lastTime = now;
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
    this.energy = ship.energy;
    this.maxEnergy = ship.maxEnergy;
    this.shield = ship.shield;
    this.maxShield = ship.maxShield;
    this.hull = ship.hull;
    this.maxHull = ship.maxHull;
    this.maxWeaponHardpoints = ship.maxWeaponHardpoints;
    this.weaponHardpoints = [];
    this.maxCargo = ship.maxCargo;
    this.cargo = [];
    this.subsystems = [];
    this.maxSubsystems = ship.maxSubsystems;
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
    this.isAccel = false;

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
    this.name = null;
    this.karma = 0;
    this.oreCount = {
      iron: 0,
      copper: 0,
      uranium: 0,
      gold: 0,
    };
  }
  updateShip() {
    let baseEnergy = resources.ships[this.ship.id].maxEnergy;
    let baseShield = resources.ships[this.ship.id].maxShield;
    let baseHull = resources.ships[this.ship.id].maxHull;
    let baseCargo = resources.ships[this.ship.id].maxCargo;

    for (let i in this.ship.subsystems) {
      let subsystem = this.ship.subsystems[i];
      baseEnergy += subsystem.maxEnergy;
      baseShield += subsystem.maxShield;
      baseHull += subsystem.maxHull;
      baseCargo += subsystem.maxCargo;
    }
    this.ship.maxEnergy = baseEnergy;
    this.ship.maxShield = baseShield;
    this.ship.maxHull = baseHull;
    this.ship.maxCargo = baseCargo;
    console.log(this.ship);
  }
  updateBoundary() {
    if (this.posXY[0] < -350) {
      this.posXY[0] = 10350;
    };
    if (this.posXY[0] > 10350) {
      this.posXY[0] = -350;
    };
    if (this.posXY[1] < -350) {
      this.posXY[1] = 10350;
    };
    if (this.posXY[1] > 10350) {
      this.posXY[1] = -350;
    };
  }
  updateTrade() {
    let pack = [];
    this.oreCounter();
    //  pack.push(this.id, this.oreCount, this.credits, this.ship.cargo, this.ship.weaponHardpoints,this.ship.subsystems);
    pack.push(this.id, this.oreCount, this.credits, this.ship);
    for (let stat in staticObjArray.spaceStations) {
      let station = staticObjArray.spaceStations[stat];
      pack.push([station.oreStock, station.id])
    }
    io.emit('trade update', pack);
    pack = [];
  }
  updatePlayer(dt) {
    this.updateBoundary();
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

  acceleratePlayer(dt) {
    this.veloXY[0] += Math.sin(toRad(this.angle)) * this.ship.accel * dt;
    this.veloXY[1] += Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    this.isAccel = true;
  }
  decceleratePlayer(dt) {
    this.veloXY[0] -= Math.sin(toRad(this.angle)) * this.ship.accel * dt;
    this.veloXY[1] -= Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    this.isAccel = true;
  }
  shootBullet(now, num) {
    if (this.ship.weaponHardpoints.length > 0 && this.ship.weaponHardpoints[num]) {
      if (this.ship.energy >= this.ship.weaponHardpoints[num].energyUsage) {
        if (now - this.timeFiredBullet[num] > this.ship.weaponHardpoints[num].rateOfFire) {
          this.ship.energy -= this.ship.weaponHardpoints[num].energyUsage;
          this.timeFiredBullet[num] = Date.now();
          let bullet = new _bullet(this.posXY[0], this.posXY[1], 'bullet', `bullet${this.id+now}`, this.ship.weaponHardpoints[num].bullet, [], [], this.angle);
          bullet.owner = this;
          bullet.veloXY[0] = this.veloXY[0] + Math.sin(toRad(this.angle)) * this.ship.weaponHardpoints[num].bulletVelocity;
          bullet.veloXY[1] = this.veloXY[1] + Math.cos(toRad(this.angle)) * this.ship.weaponHardpoints[num].bulletVelocity;
          dynamicObjArray['bullet'][bullet.id] = bullet;
          addObjUpdate(false, false, bullet);
          setTimeout(function () {
            if (dynamicObjArray['bullet'][bullet.id]) {
              removeObjUpdate(false, false, dynamicObjArray['bullet'][bullet.id]);
              dynamicObjArray['bullet'][bullet.id];
              delete dynamicObjArray['bullet'][bullet.id];
            }
          }, this.ship.weaponHardpoints[num].dissipation)
        }
      }
    }
  }
  rechargeEnergyShield(dt) {
    if (this.ship.shield < this.ship.maxShield) {
      this.ship.shield += dt * 10;
    } else if (this.ship.shield > this.ship.maxShield) {
      this.ship.shield = this.ship.maxShield
    }
    if (this.ship.energy < this.ship.maxEnergy) {
      this.ship.energy += .5;
    } else if (this.ship.energy > this.ship.maxEnergy) {
      this.ship.energy = this.ship.maxEnergy
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
          this.updateTrade();
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
class _npc extends _gameObject {
  constructor(posX, posY, type, id, sprite, dispXY) {
    super(posX, posY, type, id, sprite, dispXY);
    // this.ship.energy = 0;
    // this.ship.shield = 0;
    // this.ship.hull = this.ship.hull;
    this.timeFiredBullet = [];
    for (let i = 0; i < this.ship.maxWeaponHardpoints; i++) {
      this.timeFiredBullet.push(Date.now());
    };
    this.target = null;
    this.targetStation = null;
    //   this.updateNpc();
  }
  updateBoundary() {
    if (this.posXY[0] < -350) {
      this.posXY[0] = 10350;
    };
    if (this.posXY[0] > 10350) {
      this.posXY[0] = -350;
    };
    if (this.posXY[1] < -350) {
      this.posXY[1] = 10350;
    };
    if (this.posXY[1] > 10350) {
      this.posXY[1] = -350;
    };
  }
  updateNpc(dt) {
    this.updateBoundary();
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

    this.rechargeEnergyShield(dt)

  }
  rechargeEnergyShield(dt) {
    if (this.ship.shield < this.ship.maxShield) {
      this.ship.shield += dt * 10;
    } else if (this.ship.shield > this.ship.maxShield) {
      this.ship.shield = this.ship.maxShield
    }
    if (this.ship.energy < this.ship.maxEnergy) {
      this.ship.energy += .5;
    } else if (this.ship.energy > this.ship.maxEnergy) {
      this.ship.energy = this.ship.maxEnergy
    }
  }
  killVelocity(dt, multiplier = 1) {
    if (this.veloXY[0] > 0) {
      this.veloXY[0] -= this.ship.accel * dt * multiplier
    } else if (this.veloXY[0] < 0) {
      this.veloXY[0] += this.ship.accel * dt * multiplier
    }
    if (this.veloXY[1] > 0) {
      this.veloXY[1] -= this.ship.accel * dt * multiplier
    } else if (this.veloXY[1] < 0) {
      this.veloXY[1] += this.ship.accel * dt * multiplier
    }
  }
  engageTarget(dt, target) {
    let relativeAngle = Math.floor(findAngle(this, target));
    if (relativeAngle > this.angle) {
      this.angle += 1;
    } else if (relativeAngle < this.angle) {
      this.angle -= 1;
    }
    let distance = findDistance(this, target);
    if (distance > 100 && this.angle + 30 > relativeAngle && this.angle - 30 < relativeAngle) {
      this.accelerate(dt)
    } else {
      this.deccelerate(dt)
    }
    if (distance < 300 && this.angle + 1 > relativeAngle && this.angle - 1 < relativeAngle) {
      this.shootBullet()
    }
  }
  shootBullet() {
    if (this.ship.energy >= this.ship.weaponHardpoints[0].energyUsage) {
      if (Date.now() - this.timeFiredBullet[0] > this.ship.weaponHardpoints[0].rateOfFire) {
        this.ship.energy -= this.ship.weaponHardpoints[0].energyUsage;
        this.timeFiredBullet[0] = Date.now();
        let bullet = new _bullet(this.posXY[0], this.posXY[1], 'bullet', `bullet${this.id+Date.now()}`, this.ship.weaponHardpoints[0].bullet, [], [], this.angle);
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
  accelerate(dt) {
    this.veloXY[0] += Math.sin(toRad(this.angle)) * this.ship.accel * dt;
    this.veloXY[1] += Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    this.isAccel = true;
  }
  deccelerate(dt) {
    this.veloXY[0] -= Math.sin(toRad(this.angle)) * this.ship.accel * dt;
    this.veloXY[1] -= Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    this.isAccel = true;
  }

}

class _trader extends _npc {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
    this.targetStation = ranKey(staticObjArray.spaceStations)
  }
  updateNpc(dt) {
    super.updateNpc(dt);
    if (this.target) {
      let distance = findDistance(this, this.target)
      if (!this.target.active || distance > 600) {
        this.target = null
      }
    }
    this.target ? this.engageTarget(dt, this.target) :
      this.tradeRun(dt);
  }
  tradeRun(dt) {
    let distance = findDistance(this, this.targetStation);
    let relativeVelocity = findRelativeVelocity(this, this.targetStation);
    let relativeAngle = Math.floor(findAngle(this, this.targetStation) - this.angle);

    if (relativeAngle > 0) {
      this.angle += 1;
    } else if (relativeAngle < 0) {
      this.angle -= 1;
    };
    if (distance > 100) {
      if (distance > 600 && Math.abs(relativeVelocity) < 150) {
        this.accelerate(dt)
      } else if (distance < 300 && Math.abs(relativeVelocity) > 30) {
        this.killVelocity(dt, .08)
      } else {
        this.accelerate(dt)
      }
    }

    if (distance < 100) {
      if (distance > 60 && Math.abs(relativeVelocity) > 20) {
        this.killVelocity(dt, .20)
      } else if (distance < 60 && Math.abs(relativeVelocity) <= 5) {
        this.active = false;
        setTimeout(() => {
          this.active = true;
          this.targetStation = ranKey(staticObjArray.spaceStations);
        }, 5000 + ranN(5000))
      } else if (distance < 60 && Math.abs(relativeVelocity) > 5) {
        this.killVelocity(dt, .05)
      } else {
        this.accelerate(dt)
      };
    }
  }
}
class _police extends _npc {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
    this.patrolPoint = {
      posXY: [1000 + ranN(8000), 1000 + ranN(8000)],
    };
  }
  updateNpc(dt) {
    super.updateNpc(dt);
    if (this.target) {
      if (this.target && this.target.karma > 200) {
        let distance = findDistance(this, this.target);
        if (distance > 600 || !this.target.active) {
          this.target = null;
        }
      } else if (this.target && this.target.karma < 200 || !this.target.active) {
        this.target = null;
      }
    }
    this.target ? this.engageTarget(dt, this.target) :
      this.patrolMap(dt);
  }
  patrolMap(dt) {
    for (let x in badBoyArray) {
      let ship = badBoyArray[x];
      let distance = findDistance(this, ship);
      if (distance < 400) {
        this.target = ship;
      }
    }
    // let playerDistance = findDistance(this, player);
    // if (playerDistance < 1000 && player.karma >= 100) {
    //   this.engagePlayer(dt, now)
    // } else 
    {
      let relativeVelocity = findRelativeVelocity(this);
      let distance = findDistance(this, this.patrolPoint);
      let relativeAngle = Math.floor(findAngle(this, this.patrolPoint));
      if (relativeAngle > this.angle + 2) {
        this.angle += 3;
      } else if (relativeAngle < this.angle) {
        this.angle -= 3;
      };
      if (distance > 600) {
        if (distance > 1200) {
          this.accelerate(dt)
        } else if (distance < 1200 && Math.abs(relativeVelocity) > 150) {
          this.killVelocity(dt, .08)
        } else {
          this.accelerate(dt)
        }
      } else if (distance < 600) {
        this.patrolPoint = {
          posXY: [1000 + ranN(8000), 1000 + ranN(8000)]
        };

      }
    }
  }

}
class _pirate extends _npc {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
    this.targetStation = staticObjArray.spaceStations['Minotaur'];
    this.patrolPoint = {
      posXY: [500 + ranN(1000), 500 + ranN(1000)],
    };
  }
  updateNpc(dt) {
    super.updateNpc(dt);
    if (this.target) {
      let distance = findDistance(this, this.targetStation);
      if (distance > 1000 || !this.target.active) {
        this.target = null;
      }
    }
    this.target ? this.engageTarget(dt, this.target) :
      this.patrolPirateStation(dt);
  }
  patrolPirateStation(dt) {
    for (let i in PLAYER_LIST) {
      let player = PLAYER_LIST[i];
      let distance = findDistance(player, this.targetStation);
      if (distance < 600 && !(this.target)) {
        this.target = player;
      }
    }
    let relativeVelocity = findRelativeVelocity(this);

    let distance = findDistance(this, this.patrolPoint);
    let relativeAngle = Math.floor(findAngle(this, this.patrolPoint));
    if (relativeAngle > this.angle + 2) {
      this.angle += 3;
    } else if (relativeAngle < this.angle) {
      this.angle -= 3;
    };
    if (distance > 600 && relativeVelocity < 150) {
      this.accelerate(dt)
    } else if (distance < 600) {
      this.patrolPoint = {
        posXY: [500 + ranN(1000), 500 + ranN(1000)]
      };

    } else if (distance > 1500) {
      this.accelerate(dt)
    }


  }
}
class _raider extends _npc {
  constructor(posX, posY, type, id, sprite) {
    super(posX, posY, type, id, sprite);
    this.targetStation = staticObjArray.spaceStations['Minotaur'];
    this.patrolPoint = {
      posXY: [3000 + ranN(2000), 4000 + ranN(2000)],
    };
  }
  updateNpc(dt) {
    super.updateNpc(dt);
    if (this.target) {
      if (this.target.ship.cargo.length <= 5 || !this.target.active) {
        this.target = null;
      }
    }
    this.target ? this.engageTarget(dt, this.target) :
      this.raidPlayer(dt);
  }
  raidPlayer(dt) {
    if (Object.keys(PLAYER_LIST).length > 0) {
      let player = ranKey(PLAYER_LIST);
      if (player.ship.cargo.length > 5) {
        this.target = player;
      } else {
        this.patrolPirateStation(dt)
      }
    } else {
      this.patrolPirateStation(dt)
    }
  }
  patrolPirateStation(dt) {
    if (Object.keys(PLAYER_LIST).length > 0) {
      for (let i in PLAYER_LIST) {
        let player = PLAYER_LIST[i];
        let distance = findDistance(player, this.targetStation);
        if (distance < 600 && player.active) {
          this.engageTarget(dt, player)
        } else {
          let relativeVelocity = findRelativeVelocity(this);

          let distance = findDistance(this, this.patrolPoint);
          let relativeAngle = Math.floor(findAngle(this, this.patrolPoint));
          if (relativeAngle > this.angle + 2) {
            this.angle += 3;
          } else if (relativeAngle < this.angle) {
            this.angle -= 3;
          };
          if (distance > 600 && relativeVelocity < 150) {
            this.accelerate(dt)
          } else if (distance < 600) {
            this.patrolPoint = {
              posXY: [3000 + ranN(2000), 4000 + ranN(2000)]
            };

          } else if (distance > 1500) {
            this.accelerate(dt)
          }

        }
      }
    }

  }
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
  player.credits = 0;
 // player.karma = 1000;
  player.active = true;
  // player.ship.weaponHardpoints[1] = resources.weapons[2];
  // player.ship.weaponHardpoints[1].bullet = resources.bullets[2];

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
generateStation(4500, 4500, 1);
generateStation(1000, 1000, 2);
generateStation(8000, 6500, 0);
generateStation(2000, 8000, 3);
generateStars(3000);

// for (let i = 0; i < 10; i++) {
//   let trader = new _trader(4600 + ranN(200), 5300 + ranN(200), 'trader', `trader${i}`, new _ship(resources.ships[0]))
//   // addObjUpdate(false,false,trader)
//   dynamicObjArray.ship.trader[trader.id] = trader;
// }
const generateNpc = (type, num, posX, posY, width = 1, height = 1) => {
  for (let i = 0; i < num; i++) {
    switch (type) {
      case 'trader':
        {
          let trader = new _trader(posX + ranN(width), posY + ranN(height), 'trader', `trader${i+Date.now()}`, new _ship(resources.ships[6 + ranN(2)]));
          trader.ship.weaponHardpoints[0] = resources.weapons[0];
          dynamicObjArray.ship.trader[trader.id] = trader;
        };
        break;
      case 'police':
        {
          let police = new _police(posX + ranN(width), posY + ranN(height), 'police', `police${i+Date.now()}`, new _ship(resources.ships[4]));
          police.ship.weaponHardpoints[0] = resources.weapons[0];
          dynamicObjArray.ship.police[police.id] = police;

        };
        break;
      case 'miner':
        {

        };
        break;
      case 'pirate':
        {
          let pirate = new _pirate(posX + ranN(width), posY + ranN(height), 'pirate', `pirate${i+Date.now()}`, new _ship(resources.ships[2 + ranN(2)]));
          pirate.ship.weaponHardpoints[0] = resources.weapons[0];
          dynamicObjArray.ship.pirate[pirate.id] = pirate;

        };
        break;
      case 'raider':
        {
          let raider = new _raider(posX + ranN(width), posY + ranN(height), 'raider', `raider${i+Date.now()}`, new _ship(resources.ships[1 + ranN(2)]));
          raider.ship.weaponHardpoints[0] = resources.weapons[0];
          dynamicObjArray.ship.raider[raider.id] = raider;

        };
        break;
    }
  }
}
const badBoyFinder = () => {
  for (let i in PLAYER_LIST) {
    let player = PLAYER_LIST[i];
    if (player.karma >= 200) {
      badBoyArray[player.id] = player;
    } else if (badBoyArray[player.id]) {
      delete badBoyArray[player.id]
    }
  }
}
generateNpc('trader', 60, 4700, 5400, 1000, 1000);
generateNpc('police', 30, 4700, 5400, 1000, 1000);
generateNpc('pirate', 20, 500, 500, 1000, 1000);
generateNpc('raider', 20, 500, 500, 1000, 1000);