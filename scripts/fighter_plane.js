const MAX_THROTTLE = 100;
const FALL_SPEED = 200;

var leftRightLock = new Lock();
var instance = null; // TEMP
class FighterPlane extends Entity{
    constructor(planeClass, angle=0, facingRight=true){
        super();
        instance = this;
        this.planeClass = planeClass;
        this.facingRight = facingRight;
        this.angle = angle;
        this.throttle = MAX_THROTTLE;
        this.maxSpeed = fileData["plane_data"][planeClass]["max_speed"];
        this.speed = this.maxSpeed;
        this.shootLock = new CooldownLock(100);
        this.hitBox = new CircleHitbox(fileData["plane_data"][planeClass]["radius"]);
        this.health = fileData["plane_data"][planeClass]["health"];
        this.throttleConstant = Math.sqrt(this.maxSpeed) / MAX_THROTTLE;
        loadRotatedImages(planeClass);

        // TODO: Remove this at some point
        setInterval(checkMoveLeftRight, 10); // Check for user input every 1/100 of a second
        setInterval(checkUpDown, 15); // Check for user input every 15/1000 of a second
        setInterval(checkThrottle, 10); // Check for user input every 1/100 of a second
        setInterval(checkShoot, 10);
    }

    damage(amount){
        this.health -= amount;
        if (this.health <= 0){
            // TODO: Explosion
            this.delete();
        }
    }

    adjustAngle(amount){
        let newAngle = this.angle;

        // Determine angle
        if (this.facingRight){
            newAngle += amount;
        }else{
            newAngle -= amount;
        }

        while(newAngle >= 360){
            newAngle -= 360;
        }
        while(newAngle < 0){
            newAngle += 360;
        }
        this.angle = Math.floor(newAngle);
    }

    face(facingRight){
        // If not switching directions nothing to do
        if (facingRight == this.facingRight){
            return;
        }
        let newAngle = 360 - this.angle;
        while (newAngle >= 360){
            newAngle -= 360;
        }
        while (newAngle < 0){
            newAngle += 360;
        }
        this.angle = newAngle;
        this.facingRight = facingRight;
        this.xVelocity *= -1;
    }

    getCurrentImage(){
        return images[this.getImageIdentifier()];
    }

    getImage(){ return this.getCurrentImage(); }

    getImageIdentifier(){
        let rightLeftStr = "_right_";
        if (!this.facingRight){
            rightLeftStr = "_left_";
        }
        return this.planeClass + rightLeftStr + this.angle.toString();
    }

    display(){
        let image = this.getCurrentImage();
        drawingContext.drawImage(this.getCurrentImage(), this.sPX, this.sPY);
    }

    getWidth(){
        return this.getCurrentImage().width;
    }

    getHeight(){
        return this.getCurrentImage().height;
    }

    tick(timeDiffMS){
        let timeProportion = (timeDiffMS / 1000);

        // Throttle - Drag
        let throttleAcc = this.throttle * this.throttleConstant;
    
        // Drag
        let dragAcc = Math.sqrt(Math.abs(this.speed));

        let acceleration = throttleAcc - dragAcc;

        // Speed
        this.speed += acceleration * timeProportion;

        // Finally the position
        
        // Handle zero throttle
        if (this.throttle > 0){
            this.y += this.getYVelocity() * timeProportion;
        }else{
            this.y -= FALL_SPEED * timeProportion;
        }

        this.x += this.getXVelocity() * timeProportion;
    }

    getXVelocity(){
        let effectiveAngle = this.getEffectiveAngle();
        let cosAngle = Math.cos(toRadians(effectiveAngle));
        return this.speed * cosAngle * (!this.facingRight ? -1 : 1);
    }

    getEffectiveAngle(){
        let effectiveAngle = this.angle;
        if (!this.facingRight){
            effectiveAngle = 360 - effectiveAngle;
        }
        return effectiveAngle;
    }

    getShootingAngle(){
        return this.angle + (this.facingRight ? 0 : 180);

    }

    getYVelocity(){
        let effectiveAngle = this.getEffectiveAngle();
        let sinAngle = Math.sin(toRadians(effectiveAngle))
        return this.speed * sinAngle;
    }

    getSpeed(){
        return this.speed;
    }

    getThrottle(){
        return this.throttle;
    }

    adjustThrottle(amt){
        this.throttle = Math.min(Math.max(0, this.throttle + amt), MAX_THROTTLE);
    }

    collidesWith(otherHitbox){
        this.hitBox.update(this.x, this.y);
        return this.hitBox.collidesWith(otherHitbox);
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
    scene.addEntity(new Bullet(instance.getX(), instance.getY(), instance.getXVelocity(), instance.getYVelocity(), instance.getShootingAngle(), instance.getID()));
}