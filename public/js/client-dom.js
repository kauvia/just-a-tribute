const playerElements = () => {
    playerContainer.className = 'status-player';
    playerContainer.id = 'player-details';
    minimapContainer.className = 'status-player';
    minimapContainer.id = 'minimap';
    secondaryContainer.appendChild(playerContainer);
    secondaryContainer.appendChild(minimapContainer);
}

const stationElements = () => {
    stationContainer.className = 'station';
    gameContainer.appendChild(stationContainer);

    let options = ['Ores', 'Weapons', 'Subsystems', 'Shipyard', 'Undock'];
    let tradeOptions = ['Ores', 'Weapons', 'Subsystems', 'Shipyard'];
    stationContainer.appendChild(createPanels(options));
    buttonFunctionality(tradeOptions);

    let undock = document.getElementById('Undock-button');
    undock.onclick = function () {
        for (num in tradeOptions) {
            let panel = document.getElementById(`${tradeOptions[num]}-panel`);
            panel.style.display = 'none';
        }
        stationContainer.style.display = 'none';
        //        leaveStation()
    };
}

const createPanels = (array) => {
    let container = document.createElement('div');
    for (let num in array) {
        let button = document.createElement('button');
        button.id = `${array[num]}-button`;
        button.className = 'button';
        button.innerHTML = `${array[num]}`;
        button.style.width = `${100/array.length}%`
        container.appendChild(button);

    };
    let playerCreditsCargo = document.createElement('div');
    playerCreditsCargo.id = 'trade-credits-cargo';
    playerCreditsCargo.style.margin = '10px 5px 0px 5px';
    playerCreditsCargo.innerHTML = `Credits = ${player.credits}c Cargo = ${player.ship.cargo.length}/${player.ship.maxCargo}`;
    container.appendChild(playerCreditsCargo);

    for (let num in array) {
        let panel = document.createElement('div');
        panel.id = `${array[num]}-panel`;
        panel.className = 'panel';
        container.appendChild(panel);
        panel.style.display = 'none';
    }
    return container;
}
const buttonFunctionality = (array) => {
    for (let num in array) {
        let button = document.getElementById(`${array[num]}-button`);
        button.onclick = function () {
            for (let num2 in array) {
                let panel = document.getElementById(`${array[num2]}-panel`);
                if (num === num2) {
                    panel.style.display = 'block';
                } else {
                    panel.style.display = 'none';
                }
            }
        }
    }
}
const updateCreditCargoDisp = () => {
    let tradeCreditCargo = document.getElementById('trade-credits-cargo');
    tradeCreditCargo.innerHTML = `Credits = ${player.credits}c Cargo = ${player.ship.cargo.length}/${player.ship.maxCargo}`;
    let statusCreditCargo = document.getElementById('status-credit-cargo');
    statusCreditCargo.innerHTML = `Credits = ${player.credits}c Cargo = ${player.ship.cargo.length}/${player.ship.maxCargo}`;

}

const minimapStatics = () => {
    //  minimapContainer.style.backgroundImage = "url('images/minimap.png')";
    for (let obj in objArray) {
        if (objArray[obj].type == 'station') {
            let station = objArray[obj];
            let stationDisp = document.createElement('img');
            stationDisp.src = `${station.mapImg}`;
            stationDisp.style.height = '20px';
            stationDisp.style.width = '20px';
            if (stationDisp.src == 'images/skullcross.png') {
                stationDisp.style.height = '12px';
                stationDisp.style.width = '16px';
            }
            stationDisp.style.position = 'absolute';
            stationDisp.style.top = `${station.posXY[1]/45}px`;
            stationDisp.style.left = `${station.posXY[0]/45}px`;
            minimapContainer.appendChild(stationDisp);
        } else if (objArray[obj].type == 'asteroid') {
            let asteroid = objArray[obj];
            let lastDigit = asteroid.id;
            lastDigit = parseInt(lastDigit.slice(-1));
            if (lastDigit % 10 == 0) {
                let asteroidDisp = document.createElement('img');
                asteroidDisp.src = `${asteroid.sprite}`;
                asteroidDisp.style.height = '2px';
                asteroidDisp.style.width = '2px';
                asteroidDisp.style.position = 'absolute';
                asteroidDisp.style.top = `${asteroid.posXY[1]/40}px`;
                asteroidDisp.style.left = `${asteroid.posXY[0]/40}px`;
                minimapContainer.appendChild(asteroidDisp);
            }
        }
    }

}
const playerDisp = document.createElement('img');

const minimapUpdate = () => {
    playerDisp.src = `${player.ship.img}`;
    playerDisp.style.height = '20px';
    playerDisp.style.width = '20px';
    playerDisp.style.position = 'absolute';
    playerDisp.style.top = `${player.posXY[1]/45}px`;
    playerDisp.style.left = `${player.posXY[0]/45}px`;
    playerDisp.style.transform = `rotate(${player.angle}deg)`;
    minimapContainer.appendChild(playerDisp);
}

const playerDetailSetup = () => {
    let menuButton = document.createElement('button');
    playerContainer.appendChild(menuButton);
    menuButton.innerHTML = 'Menu';
    menuButton.style.position = 'absolute';
    menuButton.style.top = '0px';
    menuButton.style.right = '0px';
    menuButton.onclick = () => {
        menuContainer.style.display = 'block';

    }

    let playerAndShip = document.createElement('div');
    playerContainer.appendChild(playerAndShip);
    let statusBars = ['Energy', 'Shield', 'Hull'];
    for (let i = 0; i < statusBars.length; i++) {
        let statusBarsContainer = document.createElement('div');
        statusBarsContainer.style.margin = '10px 0px'
        statusBarsContainer.id = statusBars[i];
        playerContainer.appendChild(statusBarsContainer);
        let name = document.createElement('div');
        name.style.textAlign = 'left';
        name.innerHTML = statusBars[i];
        statusBarsContainer.appendChild(name);
        let fullBar = document.createElement('div');
        fullBar.style.width = '100%';
        fullBar.style.borderTop = '1px solid black';
        fullBar.style.borderBottom = '1px solid black';

        fullBar.style.height = '20px';
        statusBarsContainer.appendChild(fullBar);

        let dynamicBar = document.createElement('div');
        dynamicBar.id = `${statusBars[i]}-dynamic`;
        dynamicBar.style.height = '20px';
        dynamicBar.style.width = '100%';
        dynamicBar.style.backgroundColor = 'blue';
        //      dynamicBar.style.borderRight ='1px solid black';
        fullBar.appendChild(dynamicBar)
    }


    let creditCargo = document.createElement('div');
    creditCargo.id = 'status-credit-cargo';
    playerContainer.appendChild(creditCargo);
    creditCargo.style.textAlign = 'left';

    playerAndShip.innerHTML = `Pilot : ${player.id}<br>  Ship : ${player.ship.name}`;
    creditCargo.innerHTML = `Credits = ${player.credits}c Cargo = ${player.ship.cargo.length}/${player.ship.maxCargo}`;

}

const playerDetailUpdate = () => {
    let energy = document.getElementById('Energy-dynamic');
    let shield = document.getElementById('Shield-dynamic');
    let hull = document.getElementById('Hull-dynamic');
    let statusArray = [
        [energy, player.ship.energy, player.ship.maxEnergy],
        [shield, player.ship.shield, player.ship.maxShield],
        [hull, player.ship.hull, player.ship.maxHull]
    ];
    for (let i = 0; i < statusArray.length; i++) {
        dynamicStatusBarUpdate(statusArray[i][0], statusArray[i][1], statusArray[i][2]);
    }
}
const dynamicStatusBarUpdate = (display, status, maxStatus) => {
    display.style.width = `${status/maxStatus*100}%`;
    let statusPercentage = status / maxStatus * 100;
    if (statusPercentage < 33) {
        display.style.backgroundColor = 'red';
    } else if (statusPercentage < 67) {
        display.style.backgroundColor = 'yellow';
    } else {
        display.style.backgroundColor = 'blue';
    }
}



const menuScreenSetup = () => {
    menuContainer.id = 'menu-container';
    menuContainer.style.backgroundImage = 'url(images/minimap.png)';
    let loginContainer = document.createElement('div');
    loginContainer.style.marginTop = '20%';

    gameContainer.appendChild(menuContainer);
    menuContainer.appendChild(loginContainer);

    let gameTitle = document.createElement('div');
    gameTitle.style.fontSize = '55px';
    gameTitle.style.color = 'antiquewhite';
    gameTitle.innerHTML = 'Star Plebe';
    loginContainer.appendChild(gameTitle);

    let loginForm = document.createElement("form");
    loginForm.style.color = 'white';
    let usernameText = document.createElement("div");
    usernameText.innerHTML = "Username: "
    let usernameInput = document.createElement("input");
    usernameInput.type = 'text';
    usernameInput.name = 'username';
    usernameInput.id = 'username';
    let passwordText = document.createElement("div");
    passwordText.innerHTML = "Password: "
    let passwordInput = document.createElement("input");
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.id = 'password';
    let newAccountText = document.createElement("div");
    newAccountText.innerHTML = "New Account?"
    let newAccountCheckBox = document.createElement("input");
    newAccountCheckBox.type = 'checkbox';
    newAccountCheckBox.value = 'new';
    newAccountCheckBox.id = 'new-account';
    let loginButton = document.createElement("input");
    loginButton.type = 'button';
    loginButton.value = "Log In";
    loginButton.onclick = loginAction;

    loginForm.appendChild(usernameText)
    loginForm.appendChild(usernameInput)
    loginForm.appendChild(passwordText)
    loginForm.appendChild(passwordInput)
    loginForm.appendChild(newAccountText)
    loginForm.appendChild(newAccountCheckBox)
    loginForm.appendChild(loginButton)
    loginContainer.appendChild(loginForm)


    let instructionButton = document.createElement('button');
    instructionButton.id = `instruction-button`;
    instructionButton.className = 'button';
    instructionButton.innerHTML = `Instruction`;
    instructionButton.style.width = '40%';
    instructionButton.style.marginTop = '5px';
    instructionButton.style.height = '40px';
    instructionButton.onclick = openInstruction;
    loginContainer.appendChild(instructionButton);
}

const openInstruction = () => {
    let instructionContainer = document.createElement('div');
    instructionContainer.id = 'instruction-container';
    instructionContainer.style.textAlign = 'center';
    instructionContainer.style.backgroundImage = 'url(images/minimap.png)';
    let instructionText = document.createElement('div');
    let closeButton = document.createElement('button');
    instructionContainer.appendChild(instructionText);
    instructionContainer.appendChild(closeButton);
    gameContainer.appendChild(instructionContainer);

    instructionContainer.style.display = 'block';
    menuContainer.style.display = 'none';

    closeButton.onclick = () => {
        instructionContainer.style.display = 'none';
        menuContainer.style.display = 'block';
    }
    closeButton.innerHTML = 'Close Instructions';

    instructionText.style.marginTop = '20%'
    instructionText.style.marginBottom = '10%'

    instructionText.style.color = 'antiquewhite'
    instructionText.style.fontSize = '33px'
    instructionText.innerHTML = 'Explore, Mine, Trade, Kill <br> Warning: Killing peaceful ships will result in retaliation. <br> Controls : WSAD to move. F to fire.<br> R to dock or pick up ores.'

}

const gameOverSetup = () => {
    let gameOverWrapper = document.createElement('div');
    gameOverContainer.id = 'game-over-container';
    gameContainer.appendChild(gameOverContainer);
    gameOverContainer.appendChild(gameOverWrapper);
    gameOverWrapper.style.marginTop = '20%';
    let restartButton = document.createElement('button');
    let gameOverText = document.createElement('div');
    let gameOverTitle = document.createElement('div');
    gameOverTitle.innerHTML = 'Game Over';
    gameOverTitle.style.fontSize = '55px';
    gameOverTitle.style.color = 'antiquewhite';
    gameOverText.id = 'game-over-text';
    gameOverWrapper.appendChild(gameOverTitle);
    gameOverWrapper.appendChild(gameOverText);
    gameOverWrapper.appendChild(restartButton);
    gameOverContainer.style.backgroundImage = 'url(images/minimap.png)';
    restartButton.innerHTML = "Restart Game";
    restartButton.onclick = restartGame;
}

const gameOver = () => {
    let gameOverText = document.getElementById('game-over-text');
    if (player.credits <= 0) {
        gameOverText.innerHTML = 'You died peniless.'
    } else if (player.karma > 100) {
        gameOverText.innerHTML = "You died a villian."
    } else {
        gameOver.innerHTML = "Pirates hunted you down."
    };
    gameOverContainer.style.display = 'block';
    menuContainer.style.display = 'none';
}

menuScreenSetup();