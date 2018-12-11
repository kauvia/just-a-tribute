const visibleAsteroids = {};
const oreList = {};

const visibleObject = () => {
    for (asteroid in asteroidList) {
        if (-300 <= asteroidList[asteroid].dispXY[0] && asteroidList[asteroid].dispXY[0] <= 900 &&
            -300 <= asteroidList[asteroid].dispXY[1] && asteroidList[asteroid].dispXY[1] <= 900) {
            visibleAsteroids[asteroidList[asteroid].id] = asteroidList[asteroid];
        } else {
            delete visibleAsteroids[asteroidList[asteroid].id];

        }
    } //sconsole.log(Object.keys(visibleAsteroids).length)
}

setInterval(visibleObject, 500);

const collisionDetection = (dt) => {
    for (bullet in bulletObjArray) {
        for (asteroid in visibleAsteroids) {
            if (bulletObjArray[bullet].posXY[0] + bulletObjArray[bullet].width >= asteroidList[asteroid].posXY[0] &&
                bulletObjArray[bullet].posXY[0] <= asteroidList[asteroid].posXY[0] + asteroidList[asteroid].width &&
                bulletObjArray[bullet].posXY[1] + bulletObjArray[bullet].height >= asteroidList[asteroid].posXY[1] &&
                bulletObjArray[bullet].posXY[1] <= asteroidList[asteroid].posXY[1] + asteroidList[asteroid].height) {
                asteroidList[asteroid].hull -= bulletObjArray[bullet].damage;
                delete bulletObjArray[bullet];
                if (asteroidList[asteroid].hull <= 0) {
                    asteroidList[asteroid].spawnOres(dt);
                    delete asteroidList[asteroid];
                    delete visibleAsteroids[asteroid];

   //                 console.log(Object.keys(asteroidList).length)
                };



                break;
                //          console.log(asteroidList[asteroid].hp);

            }
        }
    }
}