const asteroidList = {};
const mapBorder = new _gameObject(0, 0, 0, 0, 'map-background');

const generateAsteroids = (num) => {
    for (i = 0; i < num; i++) {
        let asteroid = new _asteroid(ranN(5000), ranN(5000),0,0,'asteroid','');
        asteroid.id = `asteroid${Object.keys(asteroidList).length+ranN(1000000)}`;
        asteroid.initObject();
        asteroidList[asteroid.id]=asteroid;


    }
}
mapBorder.initObject();
mapBorder.updateObject();
mapBorder.drawObject();

generateAsteroids(400);
