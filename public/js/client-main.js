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
        objArray[packet[2][player].id] = packet[2][player];
    }
    for (let type in packet[1]){
        console.log(type)
        for (let obj in packet[1][type]){
            let entity =packet[1][type][obj];
            objArray[entity.id]=entity;
        }
    }
    for (let asteroid in packet[3].asteroid) {
        objArray[packet[3].asteroid[asteroid].id] = packet[3].asteroid[asteroid];

    }
    menuContainer.style.display = 'none';
   playerElements();
   stationElements();
   playerDetailSetup();
   minimapStatics();
    main();
};
const invalidLogin = packet => console.log(packet[1])

// receiving update packets from server

socket.on('newPosition', pack => {
    if (player.id) {
        for (let i in pack) {
            if (pack[i].id == player.id) {
                player.posXY[0] = pack[i].x;
                player.posXY[1] = pack[i].y;
                player.angle = pack[i].angle;
            } else if (objArray[pack[i].id]) {
                let otherObj = objArray[pack[i].id];
                otherObj.posXY[0] = pack[i].x;
                otherObj.posXY[1] = pack[i].y;
                otherObj.angle = pack[i].angle;
            }
        }
    }
})

socket.on('removeObj', pack => {
    if (player.id) {
        delete objArray[pack.id];
        delete visibleObjArray[pack.id];
    }
})
socket.on('addObj', pack => {
    if (player.id) {
        objArray[pack.id] = pack;

    }
})
socket.on('oreCountUpdate', pack => {
    player.oreCount = pack;
    console.log('received orecountupdate')
})
socket.on('docked', pack => {
    objArray[pack].active = false;
    if (player.id = pack){

    }
})

socket.on('death', pack => console.log(`you got killed by ${pack}`))