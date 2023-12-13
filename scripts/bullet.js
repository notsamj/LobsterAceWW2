class Bullet extends Entity{
    constructor(x, y, xVelocity, yVelocity, angle, shooterID, shooterClass){
        super();
        this.x = x;
        this.y = y;
        this.image = images["bullet"];
        angle = toRadians(angle);
        this.yVelocity = yVelocity + Math.sin(angle) * fileData["bullet_data"]["speed"];
        this.xVelocity = xVelocity + Math.cos(angle) * fileData["bullet_data"]["speed"];
        this.hitBox = new CircleHitbox(fileData["bullet_data"]["radius"]);
        this.shooterClass = shooterClass;
        this.shooterID = shooterID;
        // TODO: If on screen then
        //document.getElementById("shotSound").play();
    }

    tick(timePassed){
        let timeProportion = timePassed / 1000;
        let yAcceleration = fileData["constants"]["GRAVITY"] * timeProportion;

        this.yVelocity = this.yVelocity - yAcceleration;
        this.x += this.xVelocity * timeProportion;
        this.y += this.yVelocity * timeProportion;

        // If below ground
        if (this.y < 0 || Math.abs(this.yVelocity) > fileData["constants"]["CANVAS_HEIGHT"] * fileData["constants"]["MAX_BULLET_Y_VELOCITY_MULTIPLIER"]){
            this.delete();
        }
    }

    getWidth(){
        return this.image.width;
    }
    getHeight(){
        return this.image.height;
    }
    getImage(){
        return this.image;
    }

    getHitbox(){
        this.hitBox.update(this.x, this.y);
        return this.hitBox;
    }

    getShooterID(){
        return this.shooterID;
    }

    getShooterClass(){
        return this.shooterClass;
    }

    getXVelocity(){
        return this.xVelocity;
    }

    getYVelocity(){
        return this.yVelocity;
    }

    collidesWith(otherEntity, timeDiff){
        let timeProportion = timeDiff / 1000;

        let bHitbox = this.getHitbox();
        let bXV = this.getXVelocity();
        let bYV = this.getYVelocity();
        let bEndX = this.x;
        let bEndY = this.y;
        let bStartX = bEndX - bXV * timeProportion;
        let bStartY = bEndY - bYV * timeProportion;
        let bX = bStartX;
        let bY = bStartY;

        let oHitbox = otherEntity.getHitbox();
        let oXV = otherEntity.getXVelocity();
        let oYV = otherEntity.getYVelocity();
        let oEndX = otherEntity.getX();
        let oEndY = otherEntity.getY();
        let oStartX = oEndX - oXV * timeProportion;
        let oStartY = oEndY - oYV * timeProportion;
        let oX = oStartX;
        let oY = oStartY;

        // Before doing the costly interpolation, try to simplify
        let bMinX = Math.min(bStartX, bEndX) - bHitbox.getRadiusEquivalentX();
        let bMaxX = Math.max(bStartX, bEndX) + bHitbox.getRadiusEquivalentX();
        let bMinY = Math.min(bStartY, bEndY) - bHitbox.getRadiusEquivalentY();
        let bMaxY = Math.max(bStartY, bEndY) + bHitbox.getRadiusEquivalentY();

        let oMinX = Math.min(oStartX, oEndX) - oHitbox.getRadiusEquivalentX();
        let oMaxX = Math.max(oStartX, oEndX) + oHitbox.getRadiusEquivalentX();
        let oMinY = Math.min(oStartY, oEndY) - oHitbox.getRadiusEquivalentY();
        let oMaxY = Math.max(oStartY, oEndY) + oHitbox.getRadiusEquivalentY();

        // Check if these objects are far enough apart that its not worth performing further computations
        if (bMinX > oMaxX){ return false; }
        if (bMinY > oMaxY){ return false; }
        if (bMaxX < oMinX){ return false; }
        if (bMaxY < oMinY){ return false; }
        //console.log("Checking interpolation")
        let infiniteLoopFinder = new InfiniteLoopFinder(10000, "bulletCollision");
        // Loop from start position to end position
        while (lessThanEQDir(bX, bEndX, bXV) && lessThanEQDir(bY, bEndY, bYV) && lessThanEQDir(oX, oEndX, oXV) && lessThanEQDir(oY, oEndY, oYV)){
            // Determine time or next pixel for either object
            let bXTime = (Math.abs(bXV) >= fileData["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(bX, bXV) - bX))/(Math.abs(bXV))) : Number.MAX_SAFE_INTEGER;
            let bYTime = (Math.abs(bYV) >= fileData["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(bY, bYV) - bY))/(Math.abs(bYV))) : Number.MAX_SAFE_INTEGER;
            let oXTime = (Math.abs(oXV) >= fileData["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(oX, oXV) - oX))/(Math.abs(oXV))) : Number.MAX_SAFE_INTEGER;
            let oYTime = (Math.abs(oYV) >= fileData["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(oY, oYV) - oY))/(Math.abs(oYV))) : Number.MAX_SAFE_INTEGER;
            // Depending on which pixel is going to next
            let minTime = Math.min(bXTime, bYTime, oXTime, oYTime);
            // Update positions based on time
            bX += minTime * bXV;
            bY += minTime * bYV;
            oX += minTime * oXV;
            oY += minTime * oYV;

            // Update hitbox positions
            bHitbox.update(bX, bY);
            oHitbox.update(oX, oY);

            // If when @ x,y 
            if (bHitbox.collidesWith(oHitbox)){
                return true;
            }/*else{
                console.log("False", minTime, bX, bY, oX, oY)
            }*/
            infiniteLoopFinder.count();
        }
        //console.log("Afterrwhile loop", lessThanDir(bX, bEndX, bXV), lessThanDir(bY, bEndY, bYV), lessThanDir(oX, oEndX, oXV), lessThanDir(oY, oEndY, oYV))
        //console.log("Afterrwhile loop", oY, oEndY, oYV)

        return false;
    }
}