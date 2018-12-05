class _bullet extends _gameObject {
    constructor(posX, posY, accel, angle) {
        super(posX, posY);
        this.accel = accel;
        this.angle = angle;

    }
    displayObject() {
        this.display.id = "bullet";
        gameContainer.appendChild(this.display);
    }
    updateBullet(){
        this.posX +=this.veloX;
        this.posY -= this.veloY;
        this.dispX = this.posX - player.posX + player.dispX;
        this.dispY = this.posY - player.posY + player.dispY;

    }
    accelerateBullet() {
        this.veloX = Math.sin(toRad(this.angle)) * this.accel;
        this.veloY = Math.cos(toRad(this.angle)) * this.accel;
    }
    

}

let bullet = new _bullet(2400, 2300, 1, 50);
bullet.displayObject();
bullet.updateObject();

bullet.drawObject();