var leftRightLock = new Lock();
var instance = null; // TEMP
class HumanFighterPlane extends FighterPlane{
    constructor(planeClass, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        instance = this;
        setInterval(checkMoveLeftRight, 10); // Check for user input every 1/100 of a second
        setInterval(checkUpDown, 15); // Check for user input every 15/1000 of a second
        setInterval(checkThrottle, 10); // Check for user input every 1/100 of a second
        setInterval(checkShoot, 10);
    }
}

// TODO: Move these to a more general place?

function checkMoveLeftRight(){
    let aKey = keyIsDown(65);
    let dKey = keyIsDown(68);
    let numKeysDown = 0;
    numKeysDown += aKey ? 1 : 0;
    numKeysDown += dKey ? 1 : 0;

    // Only ready to switch direction again once you've stopped holding for at least 1 cd
    if (numKeysDown === 0){
        if (!leftRightLock.isReady()){
            leftRightLock.unlock();
        }
        return;
    }else if (numKeysDown > 1){ // Can't which while holding > 1 key
        return;
    }
    if (!leftRightLock.isReady()){ return; }
    leftRightLock.lock();
    if (aKey){
        instance.face(false);
    }else if (dKey){
        instance.face(true);
    }
}


function checkUpDown(){
    let wKey = keyIsDown(87);
    let sKey = keyIsDown(83);
    let numKeysDown = 0;
    numKeysDown += wKey ? 1 : 0;
    numKeysDown += sKey ? 1 : 0;

    // Only ready to switch direction again once you've stopped holding for at least 1 cd
    if (numKeysDown === 0){
        return;
    }else if (numKeysDown > 1){ // Can't which while holding > 1 key
        return;
    }
    if (wKey){
        instance.adjustAngle(-1);
    }else if (sKey){
        instance.adjustAngle(1);
    }
}

function checkThrottle(){
    let rKey = keyIsDown(82);
    let fKey = keyIsDown(70);
    let numKeysDown = 0;
    numKeysDown += rKey ? 1 : 0;
    numKeysDown += fKey ? 1 : 0;

    // Only ready to switch direction again once you've stopped holding for at least 1 cd
    if (numKeysDown === 0){
        return;
    }else if (numKeysDown > 1){ // Can't which while holding > 1 key
        return;
    }
    if (rKey){
        instance.adjustThrottle(1);
    }else if (fKey){
        instance.adjustThrottle(-1);
    }
}

function checkShoot(){
    let spaceKey = keyIsDown(32);
    if (!instance.shootLock.isReady() || !spaceKey){
        return;
    }
    instance.shootLock.lock();
    instance.shoot();
}