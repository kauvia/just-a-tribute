

const visibleObject = () => {
    for (let asteroid in asteroidList) {
        if (-300 <= asteroidList[asteroid].dispXY[0] && asteroidList[asteroid].dispXY[0] <= 900 &&
            -300 <= asteroidList[asteroid].dispXY[1] && asteroidList[asteroid].dispXY[1] <= 900) {
            visibleAsteroids[asteroidList[asteroid].id] = asteroidList[asteroid];
        } else {
            delete visibleAsteroids[asteroidList[asteroid].id];

        }
    }
}
setInterval(visibleObject, 500);

const asteroidCollisionDetection = (bulletArray, dt) => {
    for (let x in bulletArray) {
        for (let a in visibleAsteroids) {
            let bullet = bulletArray[x];
            let asteroid = asteroidList[a];
            let distance = findDistance(bullet, asteroid);
            if (distance < asteroid.width / asteroid.numberOfFrames / 2) {
                asteroid.hull -= bullet.damage;
                if (bullet.bullet.name != 'c-beam') {
                    delete bulletArray[x];
                }
                if (asteroid.hull <= 0) {
                    asteroid.spawnOres(dt);
                    delete asteroidList[a];
                    delete visibleAsteroids[a];
                };
                break;
            }
        }
    }
}
const collisionDetection = (bulletArray, targetArray) => {
    for (let x in bulletArray) {
        for (let ship in targetArray) {
            let target = targetArray[ship];
            let bullet = bulletArray[x];
            if (bullet.owner.type != target.type) {
                let distance = findDistance(bullet, target);
                if (distance < target.width / 2 / target.numberOfFrames) {
                    if (target.ship.shield > bullet.damage) {
                        target.ship.shield -= bullet.damage;
                    } else if (target.ship.shield > 0) {
                        let shieldPenetration = bullet.damage - target.ship.shield;
                        target.ship.shield = 0;
                        target.ship.hull -= shieldPenetration;
                    } else {
                        target.ship.hull -= bullet.damage;
                    };
                    if (bullet.bullet.name != 'c-beam') {
                        delete bulletArray[x];
                    }
                    if (target.ship.hull <= 0) {
                        if (target == player){
                            gameOver();
                        }
                        if (bullet.owner == player) {
                            if (targetArray == shipArrays['trader'] || targetArray == shipArrays['police']) {
                                console.log('u attked friendly ship');
                                player.karma += 100;
                            } else if (targetArray == shipArrays['pirate'] || targetArray == shipArrays['raider']) {
                                if (player.karma > 50) {
                                    player.karma -= 50
                                } else {
                                    player.karma = 0
                                }
                            }
                        }
                        delete targetArray[ship];
                    };
                    break;
                }
            }
        }
    }
}