const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const gameContainer = document.getElementById('container');


class _gameObject {
    constructor(posX, posY, dispX, dispY, accel = 0, veloX = 0, veloY = 0, angle = 0, display = document.createElement('div')) {
        this.posX = posX;
        this.posY = posY;
        this.dispX = dispX;
        this.dispY = dispY;
        this.accel = accel;
        this.veloX = veloX;
        this.veloY = veloY;
        this.angle = angle; //in degrees
        this.display = display;
    }
    displayObject() {
        this.display.id = "object";
        gameContainer.appendChild(this.display);
    }
    drawObject() {
        this.display.style.left = this.dispX + 'px';
        this.display.style.top = this.dispY + 'px';
        this.display.style.transform = `rotate(${this.angle}deg)`;
    }
    updateObject() {
        this.dispX = this.posX - player.posX + player.dispX;
        this.dispY = this.posY - player.posY + player.dispY;
    }
}

class _player extends _gameObject {
    constructor(posX, posY, dispX, dispY, accel) {
        super(posX, posY, dispX, dispY, accel);
    }
    displayPlayer() {
        this.display.id = "player";
        gameContainer.appendChild(this.display)
    }
    drawPlayer() {
        this.display.style.left = this.dispX + 'px';
        this.display.style.top = this.dispY + 'px';
        this.display.style.transform = `rotate(${this.angle}deg)`;

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
}

const player = new _player(2500, 2500, 275, 275, 0.1);
player.displayPlayer();

const mainLoop = () => {
    playerBoundary();
    userInputListener();
    player.updatePlayer();
    player.drawPlayer();
    mapBorder.updateObject();
    mapBorder.drawObject();
    bullet.accelerateBullet();
    bullet.updateBullet();
    bullet.drawObject();

 //   console.log(`playerVeloX=${player.veloX}, playerVeloY=${player.veloY}`);

    for (asteriod in asteriodList) {
        asteriodList[asteriod].updateObject();
        asteriodList[asteriod].drawObject();
    }
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);
const asteriodList = [];

const generateAsteriods = (num) => {
    for (i = 0; i < num; i++) {
        asteriodList.push(new _gameObject(ranN(5000), ranN(5000)));
        asteriodList[i].displayObject();

    }
}
const mapBorder = new _gameObject(0, 0);
mapBorder.displayObject();
mapBorder.display.id = "map-background";
mapBorder.updateObject();
mapBorder.drawObject();
generateAsteriods(500);

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