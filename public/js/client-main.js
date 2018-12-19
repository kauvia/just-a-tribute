let socket = io();
//let player = {};

//  login system
const loginAction = () => {
    let accInfo = {};
    accInfo['username'] = document.getElementById('username').value;
    accInfo['password'] = document.getElementById('password').value;
    accInfo['newAccount'] = document.getElementById('new-account').checked;
    accInfo['id'] = socket.id;
    socket.emit('login information', accInfo);
}

socket.on('login validation', (packet) => packet[0] ? playerInit(packet) : invalidLogin(packet))

socket.on('newPosition', pack => {
    if (player.id) {
        for (let i in pack) {
            if (pack[i].id == player.id) {
                player.posXY[0] = pack[i].x;
                player.posXY[1] = pack[i].y;
                player.angle = pack[i].angle;
            } else if (objArray[pack[i].id]) {
                let otherPlayer = objArray[pack[i].id];

                otherPlayer.posXY[0] = pack[i].x;
                otherPlayer.posXY[1] = pack[i].y;
                otherPlayer.angle = pack[i].angle;
            }
        }
    }
})
socket.on('newPlayer', pack => {
    if (player.id) {
        objArray[pack.id] = pack;
    }
})
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