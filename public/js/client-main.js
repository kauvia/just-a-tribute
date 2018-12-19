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

const playerInit = packet => {
    player.id = socket.id;
    player = packet[2][player.id];
    for (let player in packet[2]) {
        objArray[packet[2][player].id] = packet[2][player];
    }
    for (let star in packet[1].stars) {
        objArray[packet[1].stars[star].id] = packet[1].stars[star];
    }
    menuContainer.style.display = 'none';
    main();
};
const invalidLogin = packet => console.log(packet[1])

// receiving packets from server(updates and newplayers)

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
socket.on('newPlayer', pack => {
    if (player.id) {
        objArray[pack.id] = pack;
    }
})

