const secondaryContainer = document.getElementById('secondary-container');
const stationContainer = document.createElement('div');
const playerContainer = document.createElement('div');

const playerElements = () => {
    playerContainer.className = 'status-player';
    secondaryContainer.appendChild(playerContainer)
}
playerElements();
const stationElements = () => {
    stationContainer.className = 'status-station';
    secondaryContainer.appendChild(stationContainer);
    let exitStation = document.createElement('button');
    stationContainer.appendChild(exitStation);
    exitStation.innerHTML = 'Leave Station';
    exitStation.onclick = function () {
        stationContainer.style.display = 'none';
        resumeGame()
    };
}
stationElements();