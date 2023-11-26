var leftRightLock = new Lock();
var instance = null; // TEMP
class FighterPlane extends Entity{
    constructor(planeClass, screenWidth, screenHeight, angle=0, facingRight=true){
        super();
        instance = this;
        this.planeClass = planeClass;
        this.facingRight = facingRight;
        this.angle = angle;
        loadRotatedImages(planeClass);

        // TODO: Remove this at some point
        setInterval(checkMoveLeftRight, 10); // Check for user input every 1/100 of a second
        setInterval(checkUpDown, 30); // Check for user input every 1/100 of a second
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
        this.angle = 360 - this.angle;
        this.facingRight = facingRight;
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