const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const gameContainer = document.getElementById('container');


class _gameObject {
    constructor(posX, posY, dispX, dispY, accel = 0, velocity = 0, angle = 0, display = document.createElement('div')) {
        this.posX = posX;
        this.posY = posY;
        this.dispX = dispX;
        this.dispY = dispY;
        this.accel = accel;
        this.velocity = velocity;
        this.angle = angle; //in degrees
        this.display = display;
    }
}

class _player extends _gameObject {
    constructor(posX, posY, dispX, dispY) {
        super(posX, posY, dispX, dispY);
    }
    displayPlayer() {
        this.display.id = "player";
        gameContainer.appendChild(this.display)
    }
    drawPlayer() {
        this.display.style.left = this.posX + 'px';
        this.display.style.top = this.posY + 'px';
        this.display.style.transform = `rotate(${this.angle}deg)`;

    }
    updatePlayer() {
        //   this.accel<=0.1 ? this.accel+=.01
        //  :this.accel>=0.1 ? this.accel-=.01
        //   :this.accel = 0;
        console.log('accel =' + this.accel + ' velocity=' + this.velocity);
        this.velocity += this.accel;
        this.posX -= Math.sin(toRad(this.angle)) * this.velocity;
        this.posY += Math.cos(toRad(this.angle)) * this.velocity;
        this.brakePlayer();
    }
    brakePlayer() {
        if (this.velocity > 2) {
            this.velocity = 2
        };
        if (this.velocity < -2) {
            this.velocity = -2
        };
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
const player = new _player(150, 150, 150, 150);
player.displayPlayer();

const mainLoop = () => {
    player.updatePlayer();
    player.drawPlayer();
    requestAnimationFrame(mainLoop);
}
requestAnimationFrame(mainLoop);