let socket = io();

//  login system
const loginAction = () => {
    let accInfo = {};
    accInfo['username'] = document.getElementById('username').value;
    accInfo['password'] = document.getElementById('password').value;
    accInfo['newAccount'] = document.getElementById('new-account').checked;
    socket.emit('login information', accInfo);
}

socket.on('login validation', (packet) => packet[0] ? playerInit(packet) : invalidLogin(packet))

const playerInit = packet => {
    console.log(packet[1].stars);
    for (let star in packet[1].stars){
        objArray[packet[1].stars[star].id]=packet[1].stars[star];
    }
    player = {posXY:[300,300],dispXY:[300,300]}
    menuContainer.style.display = 'none';
    console.log(objArray)
    main();
};
const invalidLogin = packet => console.log(packet[1])