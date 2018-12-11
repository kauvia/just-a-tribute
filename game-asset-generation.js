const asteroidList = {};
const mapBorder = new _gameObject(0, 0, 0, 0, 'map-background');
let isGameRunning = false;
const asteroidFields = [
    [300, 0, 500, 3500, 0, 1000],
    [300, 300, 1000, 2000, 1000, 1000],
    [300, 600, 1000, 1500, 2000, 3000],
    [300, 900, 0, 1000, 3000, 2000],
    [300, 1200, 3000, 1000, 1000, 4000],
    [300, 1500, 4000, 1000, 1500, 3000]
]

const startGame = () => {
    isGameRunning = true;
    for (let field in asteroidFields) {
        generateAsteroids(asteroidFields[field][0], asteroidFields[field][1], asteroidFields[field][2], asteroidFields[field][3], asteroidFields[field][4], asteroidFields[field][5])
    };
    minimapStatics();
    requestAnimFrame(main);
}
const pauseGame = () => {
    isGameRunning = false;
}
const resumeGame = () => {
    isGameRunning = true;
    requestAnimFrame(main);
}
const generateAsteroids = (num, numID, x0, width, y0, height) => {
    for (let i = 0; i < num; i++) {
        let asteroid = new _asteroid(x0 + ranN(width), y0 + ranN(height), 'asteroid', `asteroid${i+numID}`, asteroids[0], []);
        asteroid.sprite = `images/asteroid${ranN(3)+1}.png`;
        asteroidList[asteroid.id] = asteroid;
        asteroidList[asteroid.id].angle = ranN(360);
        //             asteroidList[asteroid.id].veloXY = [ranN(200)/15,ranN(200)/15];



    }
}
const leaveStation = () => {
    player.veloXY = [0, 0];
    dockedStation = null;
    resumeGame()
}

let spaceStationArray = [];
const spaceStationJilted = new _spaceStation(3500, 1500, 'station', 'Jilted', spaceStations[0]);
const spaceStationCaldera = new _spaceStation(500, 2500, 'station', 'Caldera', spaceStations[1]);
const spaceStationMinotaur = new _spaceStation(4500, 4500, 'station', 'Minotaur', spaceStations[2]);
spaceStationArray[0] = spaceStationJilted;
spaceStationArray[1] = spaceStationCaldera;
spaceStationArray[2] = spaceStationMinotaur;

resources.onReady(startGame);

const enemyArray = [];

const generateEnemy = (num) => {
    for (let i = 0; i < num; i++){
        let enemy = new _enemy(2400+ranN(300),2300+ranN(300),'enemy',`enemy${num}`,ships[1],[]);
        enemy.angle=ranN(360);
        enemyArray.push(enemy);
    }
}
generateEnemy(10);

const findAngle = (obj1,obj2)=>{
    let angle = Math.atan2(obj2.posXY[1]-obj1.posXY[1],obj2.posXY[0]-obj1.posXY[0]);
    angle = angle *180/Math.PI;
    angle += 90;
    if (angle < 0){
        angle += 360;
    }
return angle}

const findDistance =(obj1,obj2)=>{
    let distance = Math.sqrt((Math.pow(obj1.posXY[0]-obj2.posXY[0],2))+(Math.pow(obj1.posXY[1]-obj2.posXY[1],2)));
    return distance;
}
