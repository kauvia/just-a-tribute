const bullets = [{
    name: 'pea-shooter-bullet',
    img: 'images/bullet1.png',
    width: 5,
    height: 5,
    damage: 50,
}]
const weapons = [{
    name: 'pea-shooter',
    img: 'images/bullet1.png',
    bullet: bullets[0],
    bulletVelocity: 400,
    rateOfFire: 200,
}]

const ships = [{
    name: 'Mercury',
    img: 'images/ship1.png',
    width: 30,
    height: 29,
    maxSpeed: 200,
    accel: 400,
    shield: 100,
    hull: 100,
    maxWeaponHardpoints: 1,
    weaponHardpoints: [weapons[0]],
    maxCargo: 3,
    cargo: [],
}]
const ores = [{
    name: 'iron',
    img: 'images/ironore.png',
    width: 15,
    height: 15
}, {
    name: 'copper',
    img: 'images/copperore.png',
    width: 15,
    height: 15
}]
const asteroids = [{
    name: 'ferrous',
    img: `images/asteroid1.png`,
    width: 29,
    height: 29,
    hull: 100,
    ores: [ores[0], ores[0], ores[1]]
}]

const spaceStations = [{
    name: 'Jilted',
    img: 'images/station1.png',
    width: 256,
    height: 256,

}]

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

window.resources.load ([
    'images/ship1.png',
    'images/ship2.png',
    'images/asteroid1.png',
    'images/asteroid2.png',
    'images/asteroid3.png',
    'images/bullet1.png',
    'images/copperore.png',
    'images/ironore.png',
    'images/station1.png'
])