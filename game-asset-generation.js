const asteroidList = {};
const mapBorder = new _gameObject(0, 0, 0, 0, 'map-background');
let isGameRunning = false;

const startGame = () => {
    isGameRunning = true;
    generateAsteroids(1000);
    requestAnimFrame(main);
}
const pauseGame = () => {
    isGameRunning = false;
}
const resumeGame = () => {
    isGameRunning = true;
    requestAnimFrame(main);
}
const generateAsteroids = (num) => {
    for (i = 0; i < num; i++) {
        let asteroid = new _asteroid(ranN(5000), ranN(5000), 'asteroid', `asteroid${i}`, asteroids[0], []);
        asteroid.sprite=`images/asteroid${ranN(3)+1}.png`;
        asteroidList[asteroid.id] = asteroid;
        asteroidList[asteroid.id].angle = ranN(360);
  //             asteroidList[asteroid.id].veloXY = [ranN(200)/15,ranN(200)/15];



    }
}
const leaveStation = () => {
    player.veloXY=[0,0];
    resumeGame()
}

const spaceStationJilted = new _spaceStation(2600, 2600, 'station', 'stationJilted', spaceStations[0]);
resources.onReady(startGame);
