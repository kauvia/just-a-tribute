const visibleObject = () => {
    for (asteroid in asteroidList) {
        if (-300 <= asteroidList[asteroid].dispX && asteroidList[asteroid].dispX <= 900 &&
            -300 <= asteroidList[asteroid].dispY && asteroidList[asteroid].dispY <= 900) {
                asteroidList[asteroid].display.style.display = "block";
        } else {
            asteroidList[asteroid].display.style.display = "none";
        }
    }
}

setInterval(visibleObject, 700);