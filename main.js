const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const gameContainer = document.getElementById('container');

let bulletObjArray = {};




class _gameObject {
    constructor(posX, posY, type, id, sprite, dispXY = [0, 0], veloXY = [0, 0], angle = 0) {
        this.posXY = [posX, posY];

        this.type = type;
        this.id = id;
        
        this.sprite = sprite;
        this.veloXY = veloXY;
        this.angle = angle; //in degrees
        this.dispXY = dispXY;
   //     this.image = new Image();
  //      this.image.src = sprite.img;
    }


    renderObject() {
        ctx.save();
        ctx.translate(this.dispXY[0], this.dispXY[1]);
        ctx.rotate(toRad(this.angle));
        // if (this.type == 'station') {
        //     ctx.drawImage(stationImage,
        //         -this.width / 2, -this.height / 2,
        //         this.width, this.height);
        // } else if (this.type == 'bullet'){
        //     ctx.drawImage(bulletImage,
        //         -this.width / 2, -this.height / 2,
        //         this.width, this.height);
        // }else if (this.type == 'asteroid'){
        //     ctx.drawImage(asteroidImage,
        //         -this.width / 2, -this.height / 2,
        //         this.width, this.height);
        // }else if (this.type == 'ironOre') {
        //     oreImage.src=this.sprite;
        //     ctx.drawImage(oreImage,
        //         -this.width / 2, -this.height / 2,
        //         this.width, this.height);
        // }else {
        //     ctx.drawImage(image,
        //         -this.width / 2, -this.height / 2,
        //         this.width, this.height);
        // }
         ctx.drawImage(resources.get(this.sprite),
                     -this.width / 2, -this.height / 2,
                      this.width, this.height);
        ctx.restore();

    }
    updateObject(dt) {
        this.posXY[0] += this.veloXY[0] * dt;
        this.posXY[1] -= this.veloXY[1] * dt;
        this.dispXY[0] = this.posXY[0] - player.posXY[0] + player.dispXY[0];
        this.dispXY[1] = this.posXY[1] - player.posXY[1] + player.dispXY[1];
    }
}
class _player extends _gameObject {
    constructor(posX, posY, type, id, sprite, dispXY) {
        super(posX, posY, type, id, sprite, dispXY);
        this.ship = this.sprite;
        this.sprite = this.ship.img;
        this.width = this.ship.width;
        this.height = this.ship.height;
    }
    renderPlayer() {
        ctx.save();
        ctx.translate(this.dispXY[0], this.dispXY[1]);
        ctx.rotate(toRad(this.angle));
        ctx.drawImage(image,
            -this.width / 2, -this.height / 2,
            this.width, this.height);
        ctx.restore();

    }
    updatePlayer(dt) {
        this.posXY[0] += this.veloXY[0] * dt;
        this.posXY[1] -= this.veloXY[1] * dt;
        //      this.dispXY = this.posXY;
    }
    acceleratePlayer(dt) {
        this.veloXY[0] += Math.sin(toRad(this.angle)) * this.ship.accel * dt;
        this.veloXY[1] += Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    }
    decceleratePlayer(dt) {
        this.veloXY[0] -= Math.sin(toRad(this.angle)) * this.ship.accel * dt;
        this.veloXY[1] -= Math.cos(toRad(this.angle)) * this.ship.accel * dt;
    }
    shootBullet(now) {
        if (now - timeFiredBullet > this.ship.weaponHardpoints[0].rateOfFire) {
            timeFiredBullet = Date.now();
            let bullet = new _bullet(this.posXY[0], this.posXY[1], 'bullet', `bullet${gameTime}`, this.ship.weaponHardpoints[0].bullet, [], [], this.angle);
            bullet.veloXY[0] = player.veloXY[0] + Math.sin(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
            bullet.veloXY[1] = player.veloXY[1] + Math.cos(toRad(this.angle)) * this.ship.weaponHardpoints[0].bulletVelocity;
            bulletObjArray[bullet.id] = bullet;
            setTimeout(function () {
                if (bulletObjArray[bullet.id]) {
                    bulletObjArray[bullet.id];
                    delete bulletObjArray[bullet.id];
                }
            }, 10000)

        }


    }
    pickUpOre() {
        console.log('trying to pick up');
        for (const ore in oreList) {
            if (player.posXY[0] >= oreList[ore].posXY[0] - 50 &&
                player.posXY[0] <= oreList[ore].posXY[0] + 50 &&
                player.posXY[1] >= oreList[ore].posXY[1] - 50 &&
                player.posXY[1] <= oreList[ore].posXY[1] + 50
            ) {
                if (player.ship.cargo.length < player.ship.maxCargo) {
                    player.ship.cargo.push(oreList[ore]);
                    delete oreList[ore];
                    console.log(player.ship.cargo)
                } else {
                    console.log('cargo is full!!')
                }
            }

        }
    }
    enterStation() {
        console.log(player.posXY, spaceStationJilted.posXY);
        if (player.posXY[0] >= spaceStationJilted.posXY[0] - spaceStationJilted.width / 2 &&
            player.posXY[0] <= spaceStationJilted.posXY[0] + spaceStationJilted.width / 2 &&
            player.posXY[1] >= spaceStationJilted.posXY[1] - spaceStationJilted.height / 2 &&
            player.posXY[1] <= spaceStationJilted.posXY[1] + spaceStationJilted.height / 2
        ) {
            console.log('is docked;')
            stationContainer.style.display = 'block';
            pauseGame();

        }
    }
}
class _asteroid extends _gameObject {
    constructor(posX, posY, type, id, sprite) {
        super(posX, posY, type, id, sprite);
        this.ores = this.sprite.ores;
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        this.hull = this.sprite.hull;
        this.sprite = this.sprite.img;
    }

    spawnOres() {
        for (let index in this.ores) {
            let num = ranN(2);
            if (num == 1) {
                let ore = new _ore(this.posXY[0], this.posXY[1], `${this.ores[index].name}Ore`, `ore${this.ores[index].name+gameTime}`, this.ores[index]);
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
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        this.sprite = this.sprite.img;
    }

}

class _spaceStation extends _gameObject {
    constructor(posX, posY, type, id, sprite) {
        super(posX, posY, type, id, sprite);
        this.width = this.sprite.width;
        this.height = this.sprite.height;
        this.sprite = this.sprite.img;
    }

}

// class _enemy extends _gameObject {
//     constructor(posX, posY, type) {
//         super(posX, posY, type)
//     }
// }

class _bullet extends _gameObject {
    constructor(posX, posY, type, id, sprite, dispXY, veloXY, angle) {
        super(posX, posY, type, id, sprite, dispXY, veloXY, angle);
        this.bullet = this.sprite;
        this.sprite = this.bullet.img;
        this.width = this.bullet.width;
        this.height = this.bullet.height;
        this.damage = this.bullet.damage;
    }



}



const playerBoundary = (dt) => {
    if (player.posXY[0] < -350) {
        player.posXY[0] = 5350;
        visibleObject();
    };
    if (player.posXY[0] > 5350) {
        player.posXY[0] = -350;
        visibleObject();
    };
    if (player.posXY[1] < -350) {
        player.posXY[1] = 5350;
        visibleObject();
    };
    if (player.posXY[1] > 5350) {
        player.posXY[1] = -350;
        visibleObject();
    };
    if (player.veloXY[0] < -player.ship.maxSpeed) {
        player.veloXY[0] += 2 * player.ship.accel * dt
    };
    if (player.veloXY[1] < -player.ship.maxSpeed) {
        player.veloXY[1] += 2 * player.ship.accel * dt
    };
    if (player.veloXY[0] > player.ship.maxSpeed) {
        player.veloXY[0] -= 2 * player.ship.accel * dt
    };
    if (player.veloXY[1] > player.ship.maxSpeed) {
        player.veloXY[1] -= 2 * player.ship.accel * dt
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

let lastTime = Date.now();
const main = () => {
    let now = Date.now();
    let dt = (now - lastTime) / 1000.0;

    if (isGameRunning) {

        update(dt, now);
        render();

    } 
    lastTime = now;

    requestAnimFrame(main);

}

let gameTime = Date.now();

const update = (dt, now) => {
    gameTime += dt;

    userInputListener(dt, now);
    updateEntities(dt)
    collisionDetection(dt);
}

function updateEntities(dt) {
    player.updatePlayer(dt);
    playerBoundary(dt);

    for (let asteroid in asteroidList) {
        asteroidList[asteroid].updateObject(dt);
    }
    for (let ore in oreList) {
        oreList[ore].updateObject(dt);
    }
    for (let bullet in bulletObjArray) {
        bulletObjArray[bullet].updateObject(dt);
    }
    spaceStationJilted.updateObject(dt)
}

const render = () => {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    spaceStationJilted.renderObject();

    player.renderPlayer();
    for (let asteroid in asteroidList) {
        asteroidList[asteroid].renderObject()
    };
    for (let ore in oreList) {
        oreList[ore].renderObject();
    };
    for (let bullet in bulletObjArray) {
        bulletObjArray[bullet].renderObject();
    }

}
let player = new _player(2500, 2500, 'player', 'player1', ships[0], [300, 300])

let image = new Image();
image.src = player.ship.img;

let stationImage = new Image();
stationImage.src = 'images/station1.png';
let bulletImage = new Image();
bulletImage.src = 'images/bullet1.png';
let asteroidImage = new Image();
asteroidImage.src = 'images/asteroid1.png';
let oreImage = new Image();

