const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const gameContainer = document.getElementById('container');


class _gameObject {
    constructor(posX, posY, dispX, dispY, type, id, hp = 100, accel = 0, veloX = 0, veloY = 0, angle = 0, display = document.createElement('div')) {
        this.posX = posX;
        this.posY = posY;
        this.dispX = dispX;
        this.dispY = dispY;
        this.type = type;
        this.id = id;
        this.hp = hp;
        this.accel = accel;
        this.veloX = veloX;
        this.veloY = veloY;
        this.angle = angle; //in degrees
        this.display = display;
    }
    initObject() {
        this.display.className = this.type;
        this.display.id = this.id;
        gameContainer.appendChild(this.display);
    }
    drawObject() {
        this.display.style.left = this.dispX + 'px';
        this.display.style.top = this.dispY + 'px';
        this.display.style.transform = `rotate(${this.angle}deg)`;
    }
    updateObject() {
        this.posX += this.veloX;
        this.posY -= this.veloY;
        this.dispX = this.posX - player.posX + player.dispX;
        this.dispY = this.posY - player.posY + player.dispY;
    }
}

class _player extends _gameObject {
    constructor(posX, posY, dispX, dispY, type, id, hp, accel) {
        super(posX, posY, dispX, dispY, type, id, hp, accel);
    }
    updatePlayer() {
        this.posX += this.veloX;
        this.posY -= this.veloY;
    }
    acceleratePlayer() {
        this.veloX += Math.sin(toRad(this.angle)) * this.accel;
        this.veloY += Math.cos(toRad(this.angle)) * this.accel;
    }
    decceleratePlayer() {
        this.veloX -= Math.sin(toRad(this.angle)) * this.accel;
        this.veloY -= Math.cos(toRad(this.angle)) * this.accel;
    }
    shootBullet() {
        let bullet = new _bullet(this.posX, this.posY, 0, 0, 'bullet', '', 3, this.angle);
        bullet.veloX = player.veloX + Math.sin(toRad(this.angle)) * bullet.accel;
        bullet.veloY = player.veloY + Math.cos(toRad(this.angle)) * bullet.accel;
        bullet.hp = 50;
        bullet.id = `bullet${Object.keys(bulletObjArray).length+ranN(1000000)}`;
        bullet.initObject();
        bulletObjArray[bullet.id] = bullet;
        setTimeout(function () {
            if (bulletObjArray[bullet.id]) {
                bulletObjArray[bullet.id].deleteBullet();
                delete bulletObjArray[bullet.id];
            }
        }, 5000)
    }
    pickUpMineral() {

        for (const mineral in mineralList) {
            //          console.log('trying to pick up')
            if (player.posX >= mineralList[mineral].posX - 50 &&
                player.posX <= mineralList[mineral].posX + 50 &&
                player.posY >= mineralList[mineral].posY - 50 &&
                player.posY <= mineralList[mineral].posY + 50
            ) {
                mineralList[mineral].deleteMineral();
                delete mineralList[mineral];
                mineralCounter++;
                console.log(mineralCounter)

            }

        }
    }
    enterStation() {
        if (player.posX >= spaceStationJilted.posX &&
            player.posX <= spaceStationJilted.posX + 200 &&
            player.posY >= spaceStationJilted.posY &&
            player.posY <= spaceStationJilted.posY + 200
        ) {
            stationContainer.style.display='block';
            pauseGame();

        }
    }
}

class _asteroid extends _gameObject {
    constructor(posX, posY, dispX, dispY, type, id, hp) {
        super(posX, posY, dispX, dispY, type, id, hp)
    }
    deleteAsteroid() {
        let deleteAsteroid = document.getElementById(`${this.display.id}`);
        gameContainer.removeChild(deleteAsteroid);
    }
    spawnMineral() {
        let mineral = new _mineral(this.posX, this.posY, this.dispX, this.dispY, 'mineral', '', ranN(10) / 20, ranN(360));
        mineral.veloX = Math.sin(toRad(mineral.angle)) * mineral.accel;
        mineral.veloY = Math.cos(toRad(mineral.angle)) * mineral.accel;
        mineral.id = `mineral${Object.keys(mineralList).length+ranN(100000)}`;
        mineral.initObject();
        mineralList[mineral.id] = mineral;
        setTimeout(function () {
            if (mineralList[mineral.id]) {
                mineralList[mineral.id].deleteMineral();
                delete mineralList[mineral.id];
            }
        }, 10000 + ranN(3000))
    };

}

class _mineral extends _gameObject {
    constructor(posX, posY, dispX, dispY, type, id, accel, angle) {
        super(posX, posY, dispX, dispY, type, id);
        this.accel = accel;
        this.angle = angle;
    }
    deleteMineral() {
        let deleteMineral = document.getElementById(`${this.display.id}`);
        gameContainer.removeChild(deleteMineral);
    }
}

class _spaceStation extends _gameObject {
    constructor(posX, posY, dispX, dispY, type, id) {
        super(posX, posY, dispX, dispY, type, id)
    }

}

class _enemy extends _gameObject {
    constructor(posX, posY, type) {
        super(posX, posY, type)
    }
}

class _bullet extends _gameObject {
    constructor(posX, posY, dispX, dispY, type, id, accel, angle) {
        super(posX, posY, dispX, dispY, type, id);
        this.accel = accel;
        this.angle = angle;
    }
    updateBullet() {
        this.posX += this.veloX;
        this.posY -= this.veloY;
        this.dispX = this.posX - player.posX + player.dispX;
        this.dispY = this.posY - player.posY + player.dispY;
    }
    deleteBullet() {
        let deleteBullet = document.getElementById(`${this.display.id}`);
        gameContainer.removeChild(deleteBullet);

    }


}

const player = new _player(2500, 2500, 275, 275, 'player', 'player1', 100, 0.1);


const mainLoop = () => {
    if (isGameRunning) {
        playerBoundary();
        userInputListener();
        player.updatePlayer();
        player.drawObject();
        mapBorder.updateObject();
        mapBorder.drawObject();
        spaceStationJilted.updateObject();
        spaceStationJilted.drawObject();
        //bullets
        if (Object.keys(bulletObjArray).length > 0) {
            for (const bullet in bulletObjArray) {
                bulletObjArray[bullet].updateBullet();
                bulletObjArray[bullet].drawObject();
            }
        }

        //asteriods
        for (const asteroid in asteroidList) {
            asteroidList[asteroid].updateObject();
            asteroidList[asteroid].drawObject();

        }

        //minerals
        for (const mineral in mineralList) {
            mineralList[mineral].updateObject();
            mineralList[mineral].drawObject();
        }
        collisionDetection();
        //   console.log(`playerVeloX=${player.veloX}, playerVeloY=${player.veloY}`);
        requestAnimationFrame(mainLoop);
    }
}


//requestAnimationFrame(mainLoop);



const playerBoundary = () => {
    if (player.posX < -300) {
        player.posX = 5300;
        visibleObject();
    };
    if (player.posX > 5300) {
        player.posX = -300;
        visibleObject();
    };
    if (player.posY < -300) {
        player.posY = 5300;
        visibleObject();
    };
    if (player.posY > 5300) {
        player.posY = -300;
        visibleObject();
    };
    if (player.veloX < -3) {
        player.veloX += 2 * player.accel
    };
    if (player.veloY < -3) {
        player.veloY += 2 * player.accel
    };
    if (player.veloX > 3) {
        player.veloX -= 2 * player.accel
    };
    if (player.veloY > 3) {
        player.veloY -= 2 * player.accel
    };
    //    console.log('velocityX='+player.veloX+'velocityY='+player.veloY)
}