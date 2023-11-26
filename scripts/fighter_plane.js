const FIGHTER_TERMINAL_VELOCITY_Y = -200; // Only for going down
const MAX_ANGLE_FOR_LIFT_UP = 65;
const MAX_THROTTLE = 100;
const MAX_VELOCITY = 500;
const DRAG_CONSTANT = 0.25;
const LIFT_CONSTANT = 0.5;
const THROTTLE_CONSTANT = Math.sqrt(MAX_VELOCITY) / MAX_THROTTLE;

var leftRightLock = new Lock();
var instance = null; // TEMP
class FighterPlane extends Entity{
    constructor(planeClass, screenWidth, screenHeight, angle=0, facingRight=true){
        super();
        instance = this;
        this.planeClass = planeClass;
        this.facingRight = facingRight;
        this.angle = angle;
        this.throttle = MAX_THROTTLE;
        this.xVelocity = MAX_VELOCITY; // TODO 0
        this.yVelocity = 0;
        this.xAcceleration = 0;
        this.yAcceleration = 0;
        loadRotatedImages(planeClass);

        // TODO: Remove this at some point
        setInterval(checkMoveLeftRight, 10); // Check for user input every 1/100 of a second
        setInterval(checkUpDown, 30); // Check for user input every 1/100 of a second
        // TODO: Check for decrease throttle
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

    ge

    tick(timeDiffMS){
        let sinAngle = Math.sin(toRadians(this.angle));
        let cosAngle = Math.cos(toRadians(this.angle));
        // Start with Acceleration

        // Start with y
        
        // Gravity
        this.yAcceleration = -1 * GRAVITY;
        // Lift Part 1
        this.yAcceleration += GRAVITY * Math.min(1, (this.xVelocity / (MAX_VELOCITY * LIFT_CONSTANT)) * (this.throttle / (MAX_THROTTLE * LIFT_CONSTANT))); // This just means as long as the plane is full throttle gravity is cancelled out
        // Lift Part 2
        // Don't allow too high angles
        if (!(this.angle > MAX_ANGLE_FOR_LIFT_UP && this.angle < 180 - MAX_ANGLE_FOR_LIFT_UP)){
            this.yAcceleration += this.throttle * THROTTLE_CONSTANT * sinAngle;
        }
        // Drag
        this.yAcceleration += decreaseAcceleration(this.yVelocity) * -1 * (-1 ? sinAngle > 0 : 1);

        // Trottle
        this.xAcceleration = this.throttle * THROTTLE_CONSTANT * (1 ? this.facingRight : -1) * cosAngle;
        // Add drag
        this.xAcceleration += decreaseAcceleration(this.xVelocity) * -1 * (-1 ? cosAngle > 0 : 1);

        // Now velocities
        // Limit negative velocity by only adding if > than -200
        if (this.yVelocity > FIGHTER_TERMINAL_VELOCITY_Y || this.yAcceleration > 0){
            this.yVelocity += this.yAcceleration * (timeDiffMS / 1000);
        }
        this.xVelocity += this.xAcceleration * (timeDiffMS / 1000);

        // Finally the position
        
        this.y += this.yVelocity * (timeDiffMS / 1000);
        this.x += this.xVelocity * (timeDiffMS / 1000);
    }

    touchesRegion(lX, rX, bY, tY){
        let x = this.getX();
        let width = this.getWidth();
        let lowerX = x - width / 2;
        let higherX = x + width / 2;
        let withinX = (lowerX >= lX && lowerX <= rX) || (higherX >= lX && higherX <= rX);
        
        let y = this.getY();
        let height = this.getHeight();
        let lowerY = y - height / 2;
        let higherY = y + height / 2;
        let withinY = (lowerY >= bY && lowerY <= tY) || (higherY >= bY && higherY <= tY);
        
        return withinX && withinY;
    }

    getXVelocity(){
        return this.xVelocity;
    }
    getYVelocity(){
        return this.yVelocity;
    }

    getYAcceleration(){
        return this.yAcceleration;
    }
    getXAcceleration(){
        return this.xAcceleration;
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
        leftRightLock.unlock();
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

function decreaseAcceleration(velocity){
    return 0.1 * velocity;
}