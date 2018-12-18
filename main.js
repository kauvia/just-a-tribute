const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const gameContainer = document.getElementById('container');

let playerName = 'Traveller';
let player;
let dockedStation = null;
let isGameRunning = false;

let bulletObjArray = {};

let shipArrays = {
    player: [],
    pirate: [],
    raider: [],
    trader: [],
    police: [],
    miner: [],
}

let asteroidList = {};
let visibleAsteroids = {};
let oreList = {};

let spaceStationArray = [];

const exhaustArray = {};
const starArray = [];

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


    renderSprite() {
        if (this.active) {
            ctx.setTransform(1, 0, 0, 1, Math.floor(this.dispXY[0]), Math.floor(this.dispXY[1]))

            if (this.angle != 0 || this.angle != 360) {
                ctx.rotate(toRad(this.angle));
            }
            if (this.numberOfFrames > 1) {
                ctx.drawImage(resources.get(this.sprite), this.frameIndex * this.width / this.numberOfFrames, 0, this.width / this.numberOfFrames, this.height, -this.width / this.numberOfFrames / 2, -this.height / 2, this.width / this.numberOfFrames, this.height);
            } else {
                ctx.drawImage(resources.get(this.sprite),
                    -this.width / 2, -this.height / 2,
                    this.width, this.height);
            }
            ctx.setTransform(1, 0, 0, 1, 0, 0)

        }
    }
    updateSprite(dt) {
        if (this.numberOfFrames > 1) {
            this.tickCount++;
            if (this.tickCount > this.ticksPerFrame) {
                this.tickCount = 0;
                if (this.frameIndex + 1 >= this.numberOfFrames) {
                    this.frameIndex = 0;
                    if (this.type == 'exhaust') {
                        delete exhaustArray[this.id];
                    }
                } else {
                    this.frameIndex++
                }
            }
            if (this.frameIndex >= this.numberOfFrames) {}
        }

        this.posXY[0] += this.veloXY[0] * dt;
        this.posXY[1] -= this.veloXY[1] * dt;
        this.dispXY[0] = this.posXY[0] - player.posXY[0] + player.dispXY[0];
        this.dispXY[1] = this.posXY[1] - player.posXY[1] + player.dispXY[1];
    }

}
class _exhaust extends _gameObject {
    constructor(posX, posY, type, id, sprite) {
        super(posX, posY, type, id, sprite);
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
    changeShip(id) {
        this.ship = ships[id];
        this.sprite = this.ship.img;
    }

    updatePlayer(dt) {
        if (this.angle != 360) {
            this.angle = this.angle % 360;
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
    shipExhaust() {
        let exhaust1 = new _exhaust(this.posXY[0] - 10 * Math.sin(toRad(this.angle)), this.posXY[1] + 10 * Math.cos(toRad(this.angle)), 'exhaust', `exhaust${Object.keys(exhaustArray).length+gameTime}`, exhausts[0]);
        exhaustArray[exhaust1.id] = exhaust1;
    }
    acceleratePlayer(dt) {
        this.veloXY[0] += Math.sin(toRad(this.angle)) * this.ship.accel * dt;
        this.veloXY[1] += Math.cos(toRad(this.angle)) * this.ship.accel * dt;
        this.shipExhaust();
    }
    decceleratePlayer(dt) {
        this.veloXY[0] -= Math.sin(toRad(this.angle)) * this.ship.accel * dt;
        this.veloXY[1] -= Math.cos(toRad(this.angle)) * this.ship.accel * dt;
        this.shipExhaust();

    }
    shootBullet(now) {
        if (this.ship.energy >= this.ship.weaponHardpoints[0].energyUsage) {
            if (now - this.timeFiredBullet[0] > this.ship.weaponHardpoints[0].rateOfFire) {
                this.ship.energy -= this.ship.weaponHardpoints[0].energyUsage;
                this.timeFiredBullet[0] = Date.now();
                let bullet = new _bullet(this.posXY[0], this.posXY[1], 'bullet', `bullet${gameTime}`, this.ship.weaponHardpoints[0].bullet, [], [], this.angle);
                bullet.owner = this;
                bullet.veloXY[0] = this.veloXY[0] + Math.sin(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
                bullet.veloXY[1] = this.veloXY[1] + Math.cos(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
                bulletObjArray[bullet.id] = bullet;
                setTimeout(function () {
                    if (bulletObjArray[bullet.id]) {
                        bulletObjArray[bullet.id];
                        delete bulletObjArray[bullet.id];
                    }
                }, this.ship.weaponHardpoints[0].dissipation)
            }

        }
    }
    rechargeEnergyShield(dt) {
        if (this.ship.shield < this.ship.maxShield) {
            this.ship.shield += dt * 30;
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
                let ore = new _ore(this.posXY[0], this.posXY[1], `${this.ores[index].name}`, `ore${this.ores[index].name+gameTime}`, this.ores[index]);
                ore.angle = ranN(360);
                ore.veloXY[0] = Math.sin(toRad(ore.angle)) * ranN(100) / 10;
                ore.veloXY[1] = Math.cos(toRad(ore.angle)) * ranN(100) / 10;
                oreList[ore.id] = ore;
                setTimeout(function () {
                    if (oreList[ore.id]) {
                        delete oreList[ore.id];
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

class _enemy extends _gameObject {
    constructor(posX, posY, type, id, sprite, dispXY) {
        super(posX, posY, type, id, sprite, dispXY);
        this.ship.shield = 0;
        this.ship.hull = this.ship.hull;
        this.timeFiredBullet = [];
        for (let i = 0; i < this.ship.maxWeaponHardpoints; i++) {
            this.timeFiredBullet.push(Date.now());
        };
        if (this.type == 'pirate') {
            this.targetStation = spaceStationArray[2];
            this.patrolPoint = {
                posXY: [4200 + ranN(800), 4200 + ranN(800)],

            }
        } else {
            this.patrolPoint = {
                posXY: [ranN(5000), ranN(5000)],
            };
            this.targetStation = spaceStationArray[ranN(3)];

        };
    }
    shipExhaust() {
        let distanceFromPlayer = findDistance(this, player);
        if (distanceFromPlayer < 400) {
            let exhaust1 = new _exhaust(this.posXY[0] - 10 * Math.sin(toRad(this.angle)), this.posXY[1] + 10 * Math.cos(toRad(this.angle)), 'exhaust', `exhaust${Object.keys(exhaustArray).length+gameTime}`, exhausts[0]);
            exhaustArray[exhaust1.id] = exhaust1;


        }
    }
    updateEnemy(dt, now) {
        if (this.angle != 360) {
            this.angle = this.angle % 360;
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


        switch (this.type) {
            case 'pirate':
                this.patrolPirateStation(dt, now);
                break;
            case 'raider':
                this.raidPlayer(dt, now);
                break;
            case 'trader':
                this.tradeRun(dt, now);
                break;
            case 'police':
                this.patrolMap(dt, now);
                break;
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
    tradeRun(dt) {
        let distance = findDistance(this, this.targetStation);
        let relativeVelocity = findRelativeVelocity(this, this.targetStation);
        let relativeAngle = Math.floor(findAngle(this, this.targetStation) - this.angle);
        if (relativeAngle > 0) {
            this.angle += 3;
        } else if (relativeAngle < 0) {
            this.angle -= 3;
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
                    this.targetStation = spaceStationArray[ranN(3)];
                }, 5000 + ranN(5000))
            } else if (distance < 60 && Math.abs(relativeVelocity) > 5) {
                this.killVelocity(dt, .05)
            } else {
                this.accelerate(dt)
            };
        }
    }
    patrolMap(dt, now) {
        let playerDistance = findDistance(this, player);
        if (playerDistance < 1000 && player.karma >= 100) {
            this.engagePlayer(dt, now)
        } else {
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
                    posXY: [ranN(5000), ranN(5000)]
                };

            }
        }
    }
    raidPlayer(dt, now) {
        if (player.ship.cargo.length > 5) {
            this.engagePlayer(dt, now)
        } else {
            this.patrolMap(dt, now)
        }
    }
    patrolPirateStation(dt, now) {
        let playerToStationDistance = findDistance(this, this.targetStation);
        if (playerToStationDistance < 1000) {
            this.engagePlayer(dt, now)
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
                    posXY: [4000 + ranN(1000), 4000 + ranN(1000)]
                };

            } else {
                this.accelerate(dt)
            }
        }
    }
    engagePlayer(dt, now) {
        let relativeAngle = Math.floor(findAngle(this, player));
        if (relativeAngle > this.angle + 2) {
            this.angle += 3;
        } else if (relativeAngle < this.angle) {
            this.angle -= 3;
        }
        let distance = findDistance(this, player);
        if (distance > 100 && this.angle + 30 > relativeAngle && this.angle - 30 < relativeAngle) {
            this.accelerate(dt)
        } else {
            this.deccelerate(dt)
        }
        if (distance < 300 && this.angle + 1 > relativeAngle && this.angle - 1 < relativeAngle) {
            //       console.log('firing solution found');
            this.shootBullet(now)
        }
    }
    accelerate(dt) {
        this.veloXY[0] += Math.sin(toRad(this.angle)) * this.ship.accel * dt;
        this.veloXY[1] += Math.cos(toRad(this.angle)) * this.ship.accel * dt;
        this.shipExhaust()

    }
    deccelerate(dt) {
        this.veloXY[0] -= Math.sin(toRad(this.angle)) * this.ship.accel * dt;
        this.veloXY[1] -= Math.cos(toRad(this.angle)) * this.ship.accel * dt;

    }
    shootBullet(now) {
        //    console.log(now);
        if (now - this.timeFiredBullet[0] > this.ship.weaponHardpoints[0].rateOfFire) {
            this.timeFiredBullet[0] = Date.now();
            let bullet = new _bullet(this.posXY[0], this.posXY[1], 'bullet', `bullet${this.ship.id+gameTime}`, this.ship.weaponHardpoints[0].bullet, [], [], this.angle);
            bullet.owner = this;
            bullet.veloXY[0] = this.veloXY[0] + Math.sin(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
            bullet.veloXY[1] = this.veloXY[1] + Math.cos(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
            bulletObjArray[bullet.id] = bullet;
            setTimeout(function () {
                if (bulletObjArray[bullet.id]) {
                    bulletObjArray[bullet.id];
                    delete bulletObjArray[bullet.id];
                }
            }, 10000)
        }
    }
}

class _bullet extends _gameObject {
    constructor(posX, posY, type, id, sprite, dispXY, veloXY, angle) {
        super(posX, posY, type, id, sprite, dispXY, veloXY, angle);
        this.damage = this.bullet.damage;
        this.owner = this.owner;
    }
}



const objBoundary = (obj) => {
    if (obj.posXY[0] < -350) {
        obj.posXY[0] = 10350;
    };
    if (obj.posXY[0] > 10350) {
        obj.posXY[0] = -350;
    };
    if (obj.posXY[1] < -350) {
        obj.posXY[1] = 10350;
    };
    if (obj.posXY[1] > 10350) {
        obj.posXY[1] = -350;
    };

}

const checkMaxSpeed = (obj, dt) => {

    if (obj.veloXY[0] < -obj.ship.maxSpeed) {
        obj.veloXY[0] += 2 * obj.ship.accel * dt;

    };
    if (obj.veloXY[1] < -obj.ship.maxSpeed) {
        obj.veloXY[1] += 2 * obj.ship.accel * dt;

    };
    if (obj.veloXY[0] > obj.ship.maxSpeed) {
        obj.veloXY[0] -= 2 * obj.ship.accel * dt;

    };
    if (obj.veloXY[1] > obj.ship.maxSpeed) {
        obj.veloXY[1] -= 2 * obj.ship.accel * dt;

    };

}

const requestAnimFrame = (function () {
    return window.requestAnimationFrame
})();

const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;
gameContainer.appendChild(canvas);
let timeFiredBullet = Date.now();
let gameTime;
let lastTime;
const main = () => {
    let now = Date.now();
    let dt = (now - lastTime) / 1000.0;
    if (dt > 1) {
        now = Date.now();
        dt = 0.20;
    }

    if (isGameRunning) {

        update(dt, now);
        render();

        let relativeVelocity = findRelativeVelocity(player);
        //   console.log('relative'+relativeAngle+'ship angle'+player.angle )
        //   console.log(relativeVelocity)
    }
    lastTime = now;

    //       console.log(findRelativeVelocity(player, spaceStationArray[0]) + 'distance' + findDistance(player, spaceStationArray[0]))
    requestAnimFrame(main);

}




const update = (dt, now) => {
    gameTime += dt;
    visibleObject();

    userInputListener(dt, now);
    updateEntities(dt, now)
    //  console.log(findRelativeVelocity(player))
    //   console.log(Math.atan(player.veloXY[0]/player.veloXY[1])/Math.PI*180+'angle'+player.angle)

    asteroidCollisionDetection(bulletObjArray, dt);
    for (let array in shipArrays) {
        collisionDetection(bulletObjArray, shipArrays[array]);
    }
}

const updateEntities = (dt, now) => {

    for (let star in starArray) {
        starArray[star].updateSprite(dt);
    }
    for (let exhaust in exhaustArray) {
        exhaustArray[exhaust].updateSprite(dt);
    }
    for (let asteroid in asteroidList) {
        asteroidList[asteroid].updateSprite(dt);
    }
    for (let ore in oreList) {
        oreList[ore].updateSprite(dt);
    }
    for (let station in spaceStationArray) {
        spaceStationArray[station].updateSprite(dt);
    }

    for (let bullet in bulletObjArray) {
        bulletObjArray[bullet].updateSprite(dt);
    }
    for (let array in shipArrays) {
        for (let ship in shipArrays[array]) {
            objBoundary(shipArrays[array][ship]);
            if (shipArrays[array] != shipArrays['player']) {
                shipArrays[array][ship].updateEnemy(dt, now);
                shipArrays[array][ship].updateSprite(dt);

            } else {
                shipArrays[array][ship].updatePlayer(dt);
            }
        }
    }
}

const render = () => {
    minimapUpdate();
    playerDetailUpdate();
    ctx.fillStyle = 'black';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let star in starArray) {
        starArray[star].renderSprite();
    }
    for (let station in spaceStationArray) {
        spaceStationArray[station].renderSprite()
    }
    for (let exhaust in exhaustArray) {
        exhaustArray[exhaust].renderSprite();
    }
    for (let asteroid in asteroidList) {
        asteroidList[asteroid].renderSprite()
    };
    for (let ore in oreList) {
        oreList[ore].renderSprite();
    };

    for (let array in shipArrays) {
        for (let ship in shipArrays[array]) {
            shipArrays[array][ship].renderSprite();

        }
    }
    for (let bullet in bulletObjArray) {
        bulletObjArray[bullet].renderSprite();
    };
}

const visibleObject = () => {
    for (let asteroid in asteroidList) {
        if (-300 <= asteroidList[asteroid].dispXY[0] && asteroidList[asteroid].dispXY[0] <= 900 &&
            -300 <= asteroidList[asteroid].dispXY[1] && asteroidList[asteroid].dispXY[1] <= 900) {
            visibleAsteroids[asteroidList[asteroid].id] = asteroidList[asteroid];
        } else {
            delete visibleAsteroids[asteroidList[asteroid].id];

        }
    }
}

const asteroidCollisionDetection = (bulletArray, dt) => {
    for (let x in bulletArray) {
        for (let a in visibleAsteroids) {
            let bullet = bulletArray[x];
            let asteroid = asteroidList[a];
            let distance = findDistance(bullet, asteroid);
            if (distance < asteroid.width / asteroid.numberOfFrames / 2) {
                asteroid.hull -= bullet.damage;
                if (bullet.bullet.name != 'c-beam') {
                    delete bulletArray[x];
                }
                if (asteroid.hull <= 0) {
                    asteroid.spawnOres(dt);
                    delete asteroidList[a];
                    delete visibleAsteroids[a];
                };
                break;
            }
        }
    }
}
const collisionDetection = (bulletArray, targetArray) => {
    for (let x in bulletArray) {
        for (let ship in targetArray) {
            let target = targetArray[ship];
            let bullet = bulletArray[x];
            if (bullet.owner.type != target.type) {
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
                        delete bulletArray[x];
                    }
                    if (target.ship.hull <= 0) {
                        if (target == player){
                            gameOver();
                        }
                        if (bullet.owner == player) {
                            if (targetArray == shipArrays['trader'] || targetArray == shipArrays['police']) {
                                console.log('u attked friendly ship');
                                player.karma += 100;
                            } else if (targetArray == shipArrays['pirate'] || targetArray == shipArrays['raider']) {
                                if (player.karma > 50) {
                                    player.karma -= 50
                                } else {
                                    player.karma = 0
                                }
                            }
                        }
                        delete targetArray[ship];
                    };
                    break;
                }
            }
        }
    }
}