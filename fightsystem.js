let bulletArray = [];

const collisionDetection = () => {
    for (bullet in bulletArray) {
        for (asteroid in asteroidList) {
            if (Math.floor(bulletArray[bullet].posX) >= Math.floor(asteroidList[asteroid].posX) &&
                Math.floor(bulletArray[bullet].posX) <= (Math.floor(asteroidList[asteroid].posX) + 25) &&
                Math.floor(bulletArray[bullet].posY) >= Math.floor(asteroidList[asteroid].posY) &&
                Math.floor(bulletArray[bullet].posY) <= (Math.floor(asteroidList[asteroid].posY) + 25)) {
                asteroidList[asteroid].hp -= bulletArray[bullet].hp;
                bulletArray[bullet].deleteBullet();

                bulletArray.splice(bullet, 1);
                if (asteroidList[asteroid].hp <= 0) {
                    asteroidList[asteroid].deleteAsteroid();
                    asteroidList.splice(asteroid, 1)
                };



                break;
                //          console.log(asteroidList[asteroid].hp);

            }
        }
    }
}