const asteroidList = {};
const mapBorder = new _gameObject(0, 0, 0, 0, 'map-background');
let isGameRunning = false;

const startGame = () =>{
    isGameRunning = true;
    player.initObject();
    mapBorder.initObject();
    generateAsteroids(400);
    spaceStationJilted.initObject();
    requestAnimationFrame(mainLoop)
}
const pauseGame = ()=>{
    isGameRunning = false;
}
const resumeGame = ()=>{
    isGameRunning = true;
    requestAnimationFrame(mainLoop)
}
const generateAsteroids = (num) => {
    for (i = 0; i < num; i++) {
        let asteroid = new _asteroid(ranN(5000), ranN(5000),0,0,'asteroid','');
        asteroid.id = `asteroid${Object.keys(asteroidList).length+ranN(1000000000)}`;
        asteroid.initObject();
        asteroidList[asteroid.id]=asteroid;


    }
}




const spaceStationJilted = new _spaceStation (2600,2600,0,0,'space-station','jilted');

