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
    displayObject() { //for test purposes
        this.display.id = "object";
        gameContainer.appendChild(this.display);
    }
    drawObject() {
        //       this.dispY=this.posY;   //ditto
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
        //      this.dispX=this.posX;   //disable for player-centric
        //       this.dispY=this.posY;   //ditto
        this.display.style.left = this.dispX + 'px';
        this.display.style.top = this.dispY + 'px';
        this.display.style.transform = `rotate(${this.angle}deg)`;

    }
    updatePlayer() {
        //    console.log( `VeloXY=${this.veloX},${this.veloY}, angle and accel=${this.angle},${this.accel}`);
        //   console.log(`posXY=${this.posX},${this.posY}, angle and accel=${this.angle},${this.accel}`);

        //     this.posX -= Math.sin(toRad(this.angle)) * this.velocity;
        //      this.posY += Math.cos(toRad(this.angle)) * this.velocity;
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
boxArray = [];
for (i = 0; i < 100; i++) {
    let posX = ranN(1000);
    let posY = ranN(1000);
    boxArray.push(new _gameObject(posX, posY));
    //    boxArray[i].displayObject();
}

const player = new _player(5000, 5000, 500, 300, 0.3);
player.displayPlayer();

const mainLoop = () => {
    userInputListener();
    player.updatePlayer();
    playerBoundary();
    player.drawPlayer();
    //    for (box in boxArray) {
    //      boxArray[box].drawObject();
    //       boxArray[box].updateObject();
    //   }

    for (asteriod in asteriodList) {
        asteriodList[asteriod].drawObject();
        asteriodList[asteriod].updateObject();
    }
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);

const asteriodList = [];
/* const generateAsteriods = (num) => {
    for (i=0; i<num; i++){
        asteriodList.push(new _gameObject(player.dispX/2-ranN(50),player.dispY/2-ranN(500)));
    asteriodList[i].displayObject();
    };
    for (i=0; i<num; i++){
        asteriodList.push(new _gameObject(ranN(50)-player.dispX/2,player.dispY/2-ranN(500)));
    asteriodList[i+num].displayObject();
    };
    for (i=0; i<num; i++){
        asteriodList.push(new _gameObject(player.dispX/2-ranN(500),player.dispY/2-ranN(50)));
    asteriodList[i+2*num].displayObject();
    };
    for (i=0; i<num; i++){
        asteriodList.push(new _gameObject(player.dispX/2-ranN(500),ranN(50)-player.dispY/2));
    asteriodList[i+3*num].displayObject();
    };
} */
const generateAsteriods = (num) => {
    for (i = 0; i < num; i++) {
        asteriodList.push(new _gameObject(ranN(10000), ranN(10000)));
        asteriodList[i].displayObject();
    }
}

generateAsteriods(800);

const playerBoundary = () => {
    if (player.posX < -100) {
        player.posX = 9800
    };
    if (player.posX > 10100) {
        player.posX = 100
    };
    if (player.posY < -100) {
        player.posY = 9800
    };
    if (player.posY > 10100) {
        player.posY = 100
    };

    if ((Math.pow(player.veloX, 2) + Math.pow(player.veloY, 2)) > 100) {
        console.log((Math.pow(player.veloX, 2) + Math.pow(player.veloY, 2)));

        if (player.veloX > 0 && Math.abs(player.veloX) > Math.abs(player.veloY)) {
            player.veloX -= 2*player.accel
        };
        if (player.veloX < 0 && Math.abs(player.veloX) > Math.abs(player.veloY)) {
            player.veloX += 2*player.accel
        };
        if (player.veloY > 0 && Math.abs(player.veloY) > Math.abs(player.veloX)){
        player.veloY -= 2*player.accel}
        ;
        if (player.veloY < 0 && Math.abs(player.veloY) > Math.abs(player.veloX)){
            player.veloY += 2*player.accel
        }
    }
    console.log('velocityX='+player.veloX+'velocityY='+player.veloY)

}