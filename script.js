const mapKeys = {};
const userInputListener = ()=> {
onkeydown = onkeyup = function (e) {
    e = e;
    mapKeys[e.keyCode] = e.type == 'keydown';
    if (mapKeys[87]) { //w
        player.acceleratePlayer();
        this.console.log('w='+mapKeys[87]);
    };
    if (!mapKeys[87]){
        this.console.log('w='+mapKeys[87])
    }
    if (mapKeys[83]) { //s
        player.decceleratePlayer();
        this.console.log('s='+mapKeys[83])
    };


    if (mapKeys[65]) { //a
        player.angle -= 9;
    };
    if (mapKeys[68]) { //d
        player.angle += 9;
    };
    if (mapKeys[82]) { //r
        this.console.log(this);
    };
    if (mapKeys[70]) { //f
    };
}}