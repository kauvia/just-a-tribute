const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const gameContainer = document.getElementById('container');


class _gameObject {
    constructor(posX, posY, dispX, dispY, accel = 0, maxVelo=0, veloX = 0, veloY = 0, angle = 0, display = document.createElement('div')) {
        this.posX = posX;
        this.posY = posY;
        this.dispX = dispX;
        this.dispY = dispY;
        this.accel = accel;
        this.maxVelo = maxVelo;
        this.veloX = veloX;
        this.veloY = veloY;
        this.angle = angle; //in degrees
        this.display = display;
    }
    displayObject(){       //for test purposes
        this.display.id = "object";
        gameContainer.appendChild(this.display);
        this.dispX=this.posX;   //disable for player-centric
        this.dispY=this.posY;   //ditto
        this.display.style.left = this.dispX + 'px';
        this.display.style.top = this.dispY + 'px';
        this.display.style.transform = `rotate(${this.angle}deg)`;


    }
}

class _player extends _gameObject {
    constructor(posX, posY, dispX, dispY, accel, maxVelo) {
        super(posX, posY, dispX, dispY, accel, maxVelo);
    }
    displayPlayer() {
        this.display.id = "player";
        gameContainer.appendChild(this.display)
    }
    drawPlayer() {
        this.dispX=this.posX;   //disable for player-centric
        this.dispY=this.posY;   //ditto
        this.display.style.left = this.dispX + 'px';
        this.display.style.top = this.dispY + 'px';
        this.display.style.transform = `rotate(${this.angle}deg)`;

    }
    updatePlayer() {
  //      console.log( `VeloXY=${this.veloX},${this.veloY}, angle and accel=${this.angle},${this.accel}`);
        //     this.posX -= Math.sin(toRad(this.angle)) * this.velocity;
  //      this.posY += Math.cos(toRad(this.angle)) * this.velocity;
      this.posX+=this.veloX;
      this.posY-=this.veloY;
    }
    acceleratePlayer(){
        this.veloX+=Math.sin(toRad(this.angle)) * this.accel;
        this.veloY+=Math.cos(toRad(this.angle)) * this.accel;
    }
    decceleratePlayer(){
        this.veloX-=Math.sin(toRad(this.angle)) * this.accel;
        this.veloY-=Math.cos(toRad(this.angle)) * this.accel;


    }
    maxVelocity() {
        
   //     if (this.velocity > 1) {
   //         this.velocity = 1
   //     };
   //     if (this.velocity < -1) {
   //         this.velocity = -1
  //      };
        //       if (!mapKeys[87] && !mapKeys[83]) {
        //          if (player.velocity <= -.025) {
        //             player.velocity += 0.025
        //        } else if (player.velocity > -0.025 && player.velocity < 0.025) {
        //           player.velocity = 0;
        //       } else if (player.velocity >= 0.025) {
        //       player.velocity -= 0.025
        //     }
        //   }

    }

}
boxArray = [];
for (i=0; i<5; i++){
    let posX= ranN(575);
    let posY= ranN(575);
boxArray.push( new _gameObject(posX,posY,posX,posY,0,0,0,0,0));
boxArray[i].displayObject();
}

const player = new _player(150, 150, 150, 150, 0.1, 3);
player.displayPlayer();

const mainLoop = () => {
    userInputListener();
    player.updatePlayer();
    player.drawPlayer();
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);