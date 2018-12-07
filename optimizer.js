const visibleAsteroids = {};
const mineralList = {};

const visibleObject = () => {
    for (asteroid in asteroidList) {
        if (-300 <= asteroidList[asteroid].dispX && asteroidList[asteroid].dispX <= 900 &&
            -300 <= asteroidList[asteroid].dispY && asteroidList[asteroid].dispY <= 900) {
                asteroidList[asteroid].display.style.display = "block";
                visibleAsteroids[asteroidList[asteroid].id]=asteroidList[asteroid];
        } else {
            asteroidList[asteroid].display.style.display = "none";
            delete visibleAsteroids[asteroidList[asteroid].id];

        }
    }
}
let mineralCounter = 0;

setInterval(visibleObject, 700);