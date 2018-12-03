const mapKeys = {};
onkeydown = onkeyup = function (e) {
    e = e;
    mapKeys[e.keyCode] = e.type == 'keydown';
    if (mapKeys[87]) { //w
        //   player.velocity-=.1;   
        player.accel -= .01;
    } else {
  //      player.accel = 0
    };
    if (mapKeys[83]) { //s
        //   player.velocity+=.1;
        player.accel += .01;
    } else if (!mapKeys[87] && !mapKeys[83]) {
        player.accel = 0;
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
}