let socket = io();

//  login system
// const loginAction = () => {  //actual thing
//     let accInfo = {};
//     accInfo['username'] = document.getElementById('username').value;
//     accInfo['password'] = document.getElementById('password').value;
//     accInfo['newAccount'] = document.getElementById('new-account').checked;
//     accInfo['id'] = socket.id;
//     socket.emit('login information', accInfo);
// }
const loginAction = () => { //DevOP purposes
    let accInfo = {};
    accInfo['username'] = 'kau';
    accInfo['password'] = '123';
    accInfo['newAccount'] = false;
    accInfo['id'] = socket.id;
    socket.emit('login information', accInfo);

}

socket.on('login validation', (packet) => packet[0] ? playerInit(packet) : invalidLogin(packet))
// initial packet upon successful login
const playerInit = packet => {
    player.id = socket.id;
    player = packet[2][player.id];
    for (let player in packet[2]) {
        objArray.ships[packet[2][player].id] = packet[2][player];
    }
    console.log(packet[1])
    for (let type in packet[1]) {
        if (type == 'spaceStations') {
            for (let obj in packet[1][type]) {
                let entity = packet[1][type][obj];
                objArray.stations[entity.id] = entity;
            }
        } else if (type == 'stars') {
            for (let obj in packet[1][type]) {
                let entity = packet[1][type][obj];
                objArray.stars[entity.id] = entity;
            }
        }
    }
    for (let asteroid in packet[3].asteroid) {
        objArray.asteroids[packet[3].asteroid[asteroid].id] = packet[3].asteroid[asteroid];

    }
    menuContainer.style.display = 'none';
    playerElements();
    stationElements();
    playerDetailSetup();
    minimapStatics();
    populateTradeObjects();
    main();
};
const invalidLogin = packet => console.log(packet[1])

//sending data to server
const playerAction = (action = mapKeys) => {
    socket.emit('playerAction', action)

}


// receiving update packets from server

socket.on('newPosition', pack => {
    if (player.id) {
        for (let i in pack) {
            let obj = pack[i];
            if (obj.id == player.id) {
                player.ship.energy = obj.energy;
                player.ship.shield = obj.shield;
                player.ship.hull = obj.hull;
                player.posXY[0] = obj.x;
                player.posXY[1] = obj.y;
                player.angle = obj.angle;
                //          } else if (obj.type == 'player' || obj.type == 'pirate' || obj.type == 'raider' || obj.type == 'trader' || obj.type == 'police' || obj.type == 'miner') {
            } else if (obj.type == 'ship') {
                let ship = objArray.ships[obj.id];
                ship.ship.energy = obj.energy;
                ship.ship.shield = obj.shield;
                ship.ship.hull = obj.hull;
                ship.posXY[0] = obj.x;
                ship.posXY[1] = obj.y;
                ship.angle = obj.angle;
            } else if (obj.type == 'bullet') {
                let bullet = objArray.bullets[obj.id];
                bullet.posXY[0] = obj.x;
                bullet.posXY[1] = obj.y;
                bullet.angle = obj.angle;
            } else if (obj.type == 'asteroid') {
                let asteroid = objArray.asteroids[obj.id];
                asteroid.posXY[0] = obj.x;
                asteroid.posXY[1] = obj.y;
                asteroid.angle = obj.angle;
            } else if (obj.type == 'iron' || obj.type == 'copper' || obj.type == 'uranium' || obj.type == 'gold') {
                let ore = objArray.ores[obj.id];
                ore.posXY[0] = obj.x;
                ore.posXY[1] = obj.y;
                ore.angle = obj.angle;
            }


        }
    }
})

socket.on('removeObj', pack => {
    if (player.id) {
        // delete objArray[pack.id];
        // delete visibleObjArray[pack.id];
        let obj = pack;
        if (obj.type == 'player' || obj.type == 'pirate' || obj.type == 'raider' || obj.type == 'trader' || obj.type == 'police' || obj.type == 'miner') {
            delete objArray.ships[obj.id];
            delete visibleObjArray.ships[obj.id];
        } else if (obj.type == 'bullet') {
            delete objArray.bullets[obj.id];
            delete visibleObjArray.bullets[obj.id];
        } else if (obj.type == 'asteroid') {
            delete objArray.asteroids[obj.id];
            delete visibleObjArray.asteroids[obj.id];
        } else if (obj.type == 'iron' || obj.type == 'copper' || obj.type == 'uranium' || obj.type == 'gold') {
            delete objArray.ores[obj.id];
            delete visibleObjArray.ores[obj.id];
        }
    }
})
socket.on('addObj', pack => {
    if (player.id) {
        //   objArray[pack.id] = pack;
        let obj = pack;
        console.log(pack)
        if (obj.type == 'player' || obj.type == 'pirate' || obj.type == 'raider' || obj.type == 'trader' || obj.type == 'police' || obj.type == 'miner') {
            objArray.ships[obj.id] = obj;

        } else if (obj.type == 'bullet') {
            objArray.bullets[obj.id] = obj;

        } else if (obj.type == 'asteroid') {
            objArray.asteroids[obj.id] = obj;

        } else if (obj.type == 'iron' || obj.type == 'copper' || obj.type == 'uranium' || obj.type == 'gold') {
            objArray.ores[obj.id] = obj;

        }
    }
})
socket.on('oreCountUpdate', pack => {
    player.oreCount = pack;
    console.log('received orecountupdate')
})
socket.on('docked', pack => {
    objArray.ships[pack[0]].active = false;
    if (player.id == pack[0]) {
        player.dockedStation = pack[1];
        stationContainer.style.display = 'block';
        let station = document.getElementById(`${pack[1]}`);
        station.style.display = 'block'
        console.log(pack[1])

    }

})
socket.on('undocked', pack => {
    if (player.id == pack) {
        objArray.ships[pack].active = true;
        player.dockedStation = null;
    }
})
socket.on('trade update', pack => {
    if (pack[0] == player.id) {
        player.oreCount = pack[1];
        player.credits = pack[2];
        player.ship.cargo = pack[3];
    }
    for (let i = 4; i < pack.length; i++) {
        objArray.stations[pack[i][1]].oreStock = pack[i][0]
    }
    updateCreditCargoDisp();
})
socket.on('death', pack => console.log(`you got killed by ${pack}`))