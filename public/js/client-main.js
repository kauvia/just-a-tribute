let socket = io();
const mapKeys = {};

const userInputListener = (dt, now) => {
    //   console.log(mapKeys);
    onkeydown = onkeyup = function (e) {
        e = e;
        mapKeys[e.keyCode] = e.type == 'keydown';
        if (mapKeys[87]) { //w
            player.acceleratePlayer(dt);
        };
        if (mapKeys[83]) { //s
            player.decceleratePlayer(dt);
        };
        if (mapKeys[65]) { //a
            player.angle -= 9;
        };
        if (mapKeys[68]) { //d
            player.angle += 9;
        };
        if (mapKeys[82]) { //r
            player.pickUpOre();
            player.enterStation();
        };
        if (mapKeys[70]) { //f
            player.shootBullet(now);
        };
    }
}

//  login system
const loginAction = () => {
    let accInfo = {};
    accInfo['username'] = document.getElementById('username').value;
    accInfo['password'] = document.getElementById('password').value;
    accInfo['newAccount'] = document.getElementById('new-account').checked;
    socket.emit('login information', accInfo);
}

socket.on('login validation', (packet) => packet[0] ? playerInit(packet) : invalidLogin(packet))

const playerInit = packet => console.log(packet[1]);
const invalidLogin = packet => console.log(packet[1])