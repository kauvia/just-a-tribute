const exhausts = [{
    name: 'exhaust1',
    img: 'images/exhaust1.png',
    width: 288,
    height: 16,
    numberOfFrames: 18,
    ticksPerFrame: 1,

}]
const bullets = [{
    name: 'pea-shooter-bullet',
    img: 'images/bullet1.png',
    width: 20,
    height: 5,
    numberOfFrames: 4,
    ticksPerFrame: 6,
}, {
    name: 'dumbfire-rocket',
    img: 'images/rocket1.png',
    width: 160,
    height: 16,
    numberOfFrames: 10,
    ticksPerFrame: 4,
}, {
    name: 'homing-missile',
    img: 'images/missile1.png',
    width: 20,
    height: 20,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, {
    name: 'c-beam',
    img: 'images/beam1.png',
    width: 3,
    height: 200,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}]

const ships = [{
    name: 'Mercury',
    img: 'images/ship1.png',
    id: 0,
    width: 30,
    height: 30,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}, {
    name: 'Venus',
    img: 'images/ship2.png',
    id: 1,
    width: 30,
    height: 30,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}, {
    name: 'Mars',
    img: 'images/ship3.png',
    id: 2,
    width: 30,
    height: 30,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}, {
    name: 'Jupiter',
    img: 'images/ship4.png',
    id: 3,
    width: 30,
    height: 30,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}, {
    name: 'Saturn',
    img: 'images/ship5.png',
    id: 4,
    width: 30,
    height: 30,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}, {
    name: 'Uranus',
    img: 'images/ship6.png',
    id: 5,
    width: 30,
    height: 30,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}, {
    name: 'Neptune',
    img: 'images/ship7.png',
    id: 6,
    width: 32,
    height: 32,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}, {
    name: 'Pluto',
    img: 'images/ship8.png',
    id: 7,
    width: 26,
    height: 32,
    numberOfFrames: 1,
    ticksPerFrame: 4,
}]
const ores = [{
    index: 0,
    name: 'iron',
    img: 'images/ironore.png',
    width: 160,
    height: 16,
    numberOfFrames: 10,
    ticksPerFrame: 8,
}, {
    index: 1,
    name: 'copper',
    img: 'images/copperore.png',
    width: 160,
    height: 16,
    numberOfFrames: 10,
    ticksPerFrame: 8,
}, {
    index: 2,
    name: 'uranium',
    img: 'images/uraniumore.png',
    width: 160,
    height: 16,
    numberOfFrames: 10,
    ticksPerFrame: 8,
}, {
    index: 3,
    name: 'gold',
    img: 'images/goldore.png',
    width: 160,
    height: 16,
    numberOfFrames: 10,
    ticksPerFrame: 8,
}]
const asteroids = [{
    name: 'ferrous',
    img: `images/asteroid1.png`,
    width: 480,
    height: 16,
    numberOfFrames: 30,
    ticksPerFrame: 8,
}, {
    name: 'radioactive',
    img: `images/asteroid2.png`,
    width: 960,
    height: 32,
    numberOfFrames: 30,
    ticksPerFrame: 8,
}, {
    name: 'precious',
    img: `images/asteroid3.png`,
    width: 480,
    height: 16,
    numberOfFrames: 30,
    ticksPerFrame: 8,
}]

const spaceStations = [{
    name: 'Jilted',
    mapImg: 'images/station1.png',
    img: 'images/station1.png',
    width: 256,
    height: 256,
    numberOfFrames: 1,
    ticksPerFrame: 4,

}, {
    name: 'Caldera',
    mapImg: 'images/station1.png',
    img: 'images/station1.png',
    width: 256,
    height: 256,
    numberOfFrames: 1,
    ticksPerFrame: 4,

}, {
    name: 'Minotaur',
    mapImg: 'images/skullcross.png',
    img: 'images/station1.png',
    width: 256,
    height: 256,
    numberOfFrames: 1,
    ticksPerFrame: 4,

}]
const stars = [{
    img: 'images/star01.png',
    width: 21,
    height: 21,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, {
    img: 'images/star02.png',
    width: 9,
    height: 9,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, {
    img: 'images/star03.png',
    width: 7,
    height: 7,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, {
    img: 'images/star04.png',
    width: 9,
    height: 9,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, {
    img: 'images/star05.png',
    width: 7,
    height: 7,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, {
    img: 'images/star06.png',
    width: 14,
    height: 14,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, {
    img: 'images/star07.png',
    width: 20,
    height: 20,
    numberOfFrames: 1,
    ticksPerFrame: 1,
}, ]
let resourceCache = {};
let loading = [];
let readyCallbacks = [];

const load = (urls) => {
    if (urls instanceof Array) {
        urls.forEach(function (url) {
            _load(url)
        })
    } else {
        _load(urls)
    }
}

const _load = (url) => {


    if (resourceCache[url]) {
        return resourceCache[url]
    } else {
        let img = new Image();
        img.onload = () => {
            resourceCache[url] = img;

            if (isReady()) {
                readyCallbacks.forEach(function (func) {
                    func();
                })
            }
        }
        resourceCache[url] = false;
        img.src = url;
    }
}

const get = (url) => {
    return resourceCache[url]
}
const isReady = () => {
    let ready = true;
    for (let item in resourceCache) {
        if (resourceCache.hasOwnProperty(item) &&
            !resourceCache[item]) {
            ready = false;
        }
    }
    return ready;
}

const onReady = (func) => {
    readyCallbacks.push(func);
}
window.resources = {
    load: load,
    get: get,
    onReady: onReady,
    isReady: isReady
}

window.resources.load([
    'images/asteroid1.png',
    'images/asteroid2.png',
    'images/asteroid3.png',
    'images/bullet1.png',
    'images/rocket1.png',
    'images/missile1.png',
    'images/beam1.png',
    'images/copperore.png',
    'images/ironore.png',
    'images/uraniumore.png',
    'images/goldore.png',
    'images/station1.png',
    'images/exhaust1.png',
    'images/star01.png',
    'images/star02.png',
    'images/star03.png',
    'images/star04.png',
    'images/star05.png',
    'images/star06.png',
    'images/star07.png',
])

for (let ship in ships) {
    window.resources.load(ships[ship].img)
}
//helper functions
const ranN = (num) => Math.floor(Math.random() * num); //return random number from 0-num
const toRad = (angleInDegree) => angleInDegree * Math.PI / 180;
const findDistance = (obj1, obj2) => {
    let distance = Math.sqrt((Math.pow(obj1.posXY[0] - obj2.posXY[0], 2)) + (Math.pow(obj1.posXY[1] - obj2.posXY[1], 2)));
    return distance;
}
//var declarations
let player = {
    id: '',
    posXY: [undefined, undefined],
    dispXY: [300, 300]
};
const objArray = {};
const visibleObjArray = {};

const gameContainer = document.getElementById('container');
const secondaryContainer = document.getElementById('secondary-container');
const stationContainer = document.createElement('div');
const playerContainer = document.createElement('div');
const minimapContainer = document.createElement('div');
const menuContainer = document.createElement('div');
const gameOverContainer = document.createElement('div');

const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;
gameContainer.appendChild(canvas);
const requestAnimFrame = (function () {
    return window.requestAnimationFrame
})();

//rendering and animating sprites
const renderSprite = (obj) => {
    if (obj.active) {
        ctx.setTransform(1, 0, 0, 1, Math.floor(obj.dispXY[0]), Math.floor(obj.dispXY[1]))

        if (obj.type != 'star') {
            ctx.rotate(toRad(obj.angle));
        }
        if (obj.numberOfFrames > 1) {
            ctx.drawImage(resources.get(obj.sprite), obj.frameIndex * obj.width / obj.numberOfFrames, 0, obj.width / obj.numberOfFrames, obj.height, -obj.width / obj.numberOfFrames / 2, -obj.height / 2, obj.width / obj.numberOfFrames, obj.height);
        } else {
            ctx.drawImage(resources.get(obj.sprite),
                -obj.width / 2, -obj.height / 2,
                obj.width, obj.height);
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0)

    }
}
const updateSprite = (obj) => {
    if (obj.numberOfFrames > 1) {
        obj.tickCount++;
        if (obj.tickCount > obj.ticksPerFrame) {
            obj.tickCount = 0;
            if (obj.frameIndex + 1 >= obj.numberOfFrames) {
                obj.frameIndex = 0;
            } else {
                obj.frameIndex++
            }
        }
    }
    if (!obj.isPlayer) {
        obj.dispXY[0] = obj.posXY[0] - player.posXY[0] + player.dispXY[0];
        obj.dispXY[1] = obj.posXY[1] - player.posXY[1] + player.dispXY[1];
    }
}


const visibleObject = () => {
    for (let obj in objArray) {
        distance = findDistance(objArray[obj], player);
        if (distance < 1200) {
            visibleObjArray[objArray[obj].id] = objArray[obj];
        } else {
            delete visibleObjArray[objArray[obj].id];

        }
    }
}
//controls
const mapKeys = {};

const userInputListener = () => {
    //  console.log(mapKeys);
    onkeydown = onkeyup = function (e) {
        e = e;
        mapKeys[e.keyCode] = e.type == 'keydown';
        if (mapKeys[87] || mapKeys[83] || mapKeys[65] || mapKeys[68] || mapKeys[82] || mapKeys[70]) { //w
            this.console.log(player.angle)
            socket.emit('playerAction', mapKeys)
            //         player.acceleratePlayer(dt);
        };
        // if (mapKeys[83]) { //s
        //     socket.emit('playerAction', mapKeys)
        //    //           player.decceleratePlayer(dt);
        // };
        // if (mapKeys[65]) { //a
        //     socket.emit('playerAction', mapKeys)
        //     //           player.angle -= 9;
        // };
        // if (mapKeys[68]) { //d
        //     socket.emit('playerAction', mapKeys)
        //     //          player.angle += 9;
        // };
        // if (mapKeys[82]) { //r
        //     socket.emit('playerAction', mapKeys)
        //     //          player.pickUpOre();
        //     //           player.enterStation();
        // };
        // if (mapKeys[70]) { //f
        //     socket.emit('playerAction', mapKeys)
        //     //           player.shootBullet(now);
        // };
    }
}

//client side rendering loop
const main = () => {
    update();
    render();
    requestAnimFrame(main);

}
const update = () => {
    visibleObject();
    userInputListener();
    updateEntities()

}
const updateEntities = () => {
    for (let obj in visibleObjArray) {
        updateSprite(visibleObjArray[obj]);
    }

}
const render = () => {
    //   minimapUpdate();
    //    playerDetailUpdate();
    ctx.fillStyle = 'black';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let obj in visibleObjArray) {
        renderSprite(visibleObjArray[obj]);
    }
}