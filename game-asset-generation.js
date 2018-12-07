const asteroidList = [];
const mapBorder = new _gameObject(0, 0, 0, 0, 'map-background');

const generateAsteroids = (num) => {
    for (i = 0; i < num; i++) {
        asteroidList.push(new _asteroid(ranN(5000), ranN(5000),0,0,'asteroid',`asteroid${i}`));
        asteroidList[i].initObject();


    }
}
mapBorder.initObject();
mapBorder.updateObject();
mapBorder.drawObject();

generateAsteroids(500);
