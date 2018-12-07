let bulletObjArray = {};

const collisionDetection = () => {
    for (bullet in bulletObjArray) {
        for (asteroid in visibleAsteroids) {
            if (bulletObjArray[bullet].posX >= asteroidList[asteroid].posX &&
                bulletObjArray[bullet].posX <= asteroidList[asteroid].posX + 25 &&
                bulletObjArray[bullet].posY >= asteroidList[asteroid].posY &&
                bulletObjArray[bullet].posY <= asteroidList[asteroid].posY + 25) {
                asteroidList[asteroid].hp -= bulletObjArray[bullet].hp;
                bulletObjArray[bullet].deleteBullet();
                delete bulletObjArray[bullet];
                if (asteroidList[asteroid].hp <= 0) {
                    asteroidList[asteroid].deleteAsteroid();
                    asteroidList[asteroid].spawnMineral();
                    asteroidList[asteroid].spawnMineral();
                    delete asteroidList[asteroid];
                    delete visibleAsteroids[asteroid];

                    console.log(Object.keys(asteroidList).length)
                };



                break;
                //          console.log(asteroidList[asteroid].hp);

            }
        }
    }
}