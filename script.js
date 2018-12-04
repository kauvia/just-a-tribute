const mapKeys = {};
const userInputListener = ()=> {
onkeydown = onkeyup = function (e) {
    e = e;
    mapKeys[e.keyCode] = e.type == 'keydown';
    if (mapKeys[87]) { //w
        player.velocity -= player.accel;
        this.console.log('w='+mapKeys[87]);
    };
    if (mapKeys[83]) { //s
        player.velocity += player.accel;
        this.console.log('s='+mapKeys[83])
    };


    if (mapKeys[65]) { //a
        player.angle -= 9;
    };
    if (mapKeys[68]) { //d
        player.angle += 9;
    };
    if (mapKeys[82]) { //r
        
    };
    if (mapKeys[70]) { //f
    };
}}