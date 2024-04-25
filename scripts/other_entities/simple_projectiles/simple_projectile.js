// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("../entity.js");
    PROGRAM_DATA = require("../../../data/data_json.js");
    CircleHitbox = require("../../general/hitboxes.js").CircleHitbox;
}
/*
    Class Name: SimpleProjectile
    Description: An abstract class for a projectile
*/
class SimpleProjectile extends Entity {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The starting x position of the projectile
            y:
                The starting y position of the projectile
            gamemode:
                The gamemode that the projectile is a part of
            xVelocity:
                The starting x velocity of the projectile
            yVelocity:
                The starting y velocity of the projectile
            currentTick:
                The tick at which the projectile is created
            hitboxRadius:
                The radius of the hitbox
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, gamemode, xVelocity, yVelocity, currentTick, hitboxRadius){
        super(gamemode);
        this.startX = x;
        this.startY = y;
        this.spawnedTick = currentTick;
        this.yVI = yVelocity;
        this.xVelocity = xVelocity;
        this.hitBox = new CircleHitbox(hitboxRadius);
        this.index = null;
    }

    /*
        Method Name: getInterpolatedX
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getInterpolatedX(){
        return this.interpolatedX;
    }

    /*
        Method Name: getInterpolatedY
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getInterpolatedY(){
        return this.interpolatedY;
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Calculate x at the current tick
        Method Return: Number
    */
    getX(){
        return this.getXAtTick(this.gamemode.getNumTicks());
    }

    /*
        Method Name: getXAtTick
        Method Parameters:
            tick:
                Tick to determine the x at
        Method Description: Determine the x position of the projectile at a given tick
        Method Return: Number
    */
    getXAtTick(tick){
        // Handle asking for old information that doesn't exist
        if (tick < this.spawnedTick){
            return this.startX;
        }
        return this.startX + this.xVelocity * ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
    }

    /*
        Method Name: getGameDisplayX
        Method Parameters:
            tick:
                The tick at which to calculate the x position
            currentTime:
                The current time in milliseconds
        Method Description: Calculate the positition of the projectile at the given time and tick
        Method Return: Number
    */
    getGameDisplayX(tick, currentTime){
        return this.getXAtTick(tick) + this.xVelocity * (currentTime - this.gamemode.getLastTickTime()) / 1000;
    }

    /*
        Method Name: getY
        Method Parameters: None
        Method Description: Calculate y at the current tick
        Method Return: Number
    */
    getY(){
        return this.getYAtTick(this.gamemode.getNumTicks());
    }

    /*
        Method Name: getYAtTick
        Method Parameters:
            tick:
                Tick to determine the y at
        Method Description: Determine the y position of the projectile at a given tick
        Method Return: Number
    */
    getYAtTick(tick){
        // Handle asking for old information that doesn't exist
        if (tick < this.spawnedTick){
            return this.startY;
        }
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
        return this.startY + this.yVI * seconds - 0.5 * PROGRAM_DATA["constants"]["gravity"] * Math.pow(seconds, 2);
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Calculate the y velocity at the current tick
        Method Return: Number
    */
    getYVelocity(){
        let tick = this.gamemode.getNumTicks();
        return this.getYVelocityAtTick(tick);
    }

    /*
        Method Name: getYVelocityAtTick
        Method Parameters:
            tick:
                A tick number
        Method Description: Calculate the y velocity at the given tick
        Method Return: Number
    */
    getYVelocityAtTick(tick){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
        return this.yVI - PROGRAM_DATA["constants"]["gravity"] * seconds;
    }

    /*
        Method Name: getGameDisplayX
        Method Parameters:
            tick:
                The tick at which to calculate the y position
            currentTime:
                The current time in milliseconds
        Method Description: Calculate the positition of the bullet at the given time and tick
        Method Return: Number
    */
    getGameDisplayY(tick, currentTime){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"])) + (currentTime - this.gamemode.getLastTickTime()) / 1000;
        return this.startY + this.yVI * seconds - 0.5 * PROGRAM_DATA["constants"]["gravity"] * Math.pow(seconds, 2);
    }

    /*
        Method Name: calculateInterpolatedCoordinates
        Method Parameters:
            currentTime:
                The current time in milliseconds
        Method Description: Calculate the interpolated x and y
        Method Return: void
    */ 
    calculateInterpolatedCoordinates(currentTime){
        let currentFrameIndex = FRAME_COUNTER.getFrameIndex();
        if (GAMEMODE_MANAGER.getActiveGamemode().isPaused() || !GAMEMODE_MANAGER.getActiveGamemode().isRunning() || this.isDead() || this.lastInterpolatedFrame == currentFrameIndex){
            return;
        }
        this.lastInterpolatedFrame = currentFrameIndex;
        // The -1 is present because say I create bullet at tick=0 then numTicks++ then display well suddenly bullet position is 1 tick further than it should be
        this.interpolatedX = this.getGameDisplayX(this.gamemode.getNumTicks()-1, currentTime);
        this.interpolatedY = this.getGameDisplayY(this.gamemode.getNumTicks()-1, currentTime);
    }

    /*
        Method Name: setIndex
        Method Parameters:
            index:
                Index of the projectile in the projectile array
        Method Description: Setter
        Method Return: void
    */
    setIndex(index){
        this.index = index;
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Provide the width of the projectile image
        Method Return: Integer
    */
    getWidth(){
        return this.getImage().width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Provide the height of the projectile image
        Method Return: Integer
    */
    getHeight(){
        return this.getImage().height;
    }

    /*
        Method Name: getHitbox
        Method Parameters: None
        Method Description: Provide the hitbox (updated with the current projectile position)
        Method Return: Hitbox
    */
    getHitbox(){
        this.hitBox.update(this.getX(), this.getY());
        return this.hitBox;
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Provide the current x velocity of the bullet
        Method Return: float
    */
    getXVelocity(){
        return this.xVelocity;
    }

    /*
        Method Name: setXVelocity
        Method Parameters:
            xVelocity:
                An x velocity float
        Method Description: Setter
        Method Return: void
    */
    setXVelocity(xVelocity){
        this.xVelocity = xVelocity;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
            displayTime:
                Time at which frame is displayed
        Method Description: Displays a projectile on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        if (this.isDead()){ return; }
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;

        // Calculate interpolated coordinates
        this.calculateInterpolatedCoordinates(displayTime);
        
        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.gamemode.getScene().getDisplayX(this.getInterpolatedX(), this.getWidth()*gameZoom, lX);
        let displayY = this.gamemode.getScene().getDisplayY(this.getInterpolatedY(), this.getHeight()*gameZoom, bY);
        let translateX = displayX + this.getWidth() / 2 * gameZoom;
        let translateY = displayY + this.getHeight() / 2 * gameZoom;

        // Prepare the display
        translate(translateX, translateY);

        // Game zoom
        scale(gameZoom, gameZoom);

        // Display Projectile
        displayImage(this.getImage(), 0 - this.getWidth() / 2, 0 - this.getHeight() / 2);

        // Undo game zoom
        scale(1/gameZoom, 1/gameZoom);
        
        // Reset the translation
        translate(-1 * translateX, -1 * translateY);
    }

    /*
        Method Name: checkForProjectileLinearCollision
        Method Parameters: 
            projectile:
                A projectile object
            linearMovingObject:
                A plane or other linearly moving object
            previousTick:
                The tick before the current tick
        Method Description: Checks for a collision between a projectile and an object that has linear movement
        Method Return: Boolean, true -> collision, false -> not collision
    */
    static checkForProjectileLinearCollision(projectile, linearMovingObject, previousTick){
       let timeProportion = PROGRAM_DATA["settings"]["ms_between_ticks"]/1000;
       let h1 = projectile.getHitbox();
       let h2 = linearMovingObject.getHitbox();
       let h1Details = {
            "start_x": projectile.getXAtTick(previousTick),
            "start_y": projectile.getYAtTick(previousTick),
            "x_velocity": projectile.getXVelocity(),
            "y_velocity": projectile.getYVelocityAtTick(previousTick),
            "y_acceleration": -1 * PROGRAM_DATA["constants"]["gravity"]
        }
        let h2Details = {
            "start_x": linearMovingObject.getXAtStartOfTick(),
            "start_y": linearMovingObject.getYAtStartOfTick(),
            "x_velocity": linearMovingObject.getXVelocity(),
            "y_velocity": linearMovingObject.getYVelocity(),
            "y_acceleration": 0
        }
        // Update the hitboxes to the starting locations
        h1.update(h1Details["start_x"], h1Details["start_y"]);
        h2.update(h2Details["start_x"], h2Details["start_y"]);

        // If they immediately collide
        if (h1.collidesWith(h2)){
            return true;
        }
        // Separating code into two separate sequential blocks to try out the feature and to redeclare the time variable
        {
            // Try the l/r collision
            let leftObject = h1;
            let leftDetails = h1Details;
            let rightObject = h2;
            let rightDetails = h2Details;
            if (h2Details["start_x"] - h2.getRadiusEquivalentX() < h1Details["start_x"] - h1.getRadiusEquivalentX()){
                leftObject = h2;
                leftDetails = h2Details;
                rightObject = h1;
                rightDetails = h1Details;
            }

            /* Calculations
                leftObjectRightEnd = leftObject.getCenterX() + leftObject.getRadiusEquivalentX();
                rightObjectLeftEnd = rightObject.getCenterX() - leftObject.getRadiusEquivalentX();
                leftObjectRightEnd + leftObjectVX * time = rightObjectLeftEnd + rightObjectVX * time
                leftObjectRightEnd - rightObjectLeftEnd = (rightObjectVX - leftObjectVX) * time
                time = (leftObjectRightEnd - rightObjectLeftEnd) / (rightObjectVX - leftObjectVX)
            */
            let leftObjectRightEnd = leftObject.getCenterX() + leftObject.getRadiusEquivalentX();
            let rightObjectLeftEnd = rightObject.getCenterX() - rightObject.getRadiusEquivalentX();
            let time = safeDivide(leftObjectRightEnd - rightObjectLeftEnd, rightDetails["x_velocity"] - leftDetails["x_velocity"], 0.0000001, null);
            /* Expected values for time:
                null - Denominator close to zero
                < 0 - Never collide in x
                > 0 <= timeProportion - Collide in x at a reasonable time
                > 0 > timeProportion - Collide later on (assuming 0 acceleration)
            */
            // If time is reasonable then compute their locations and see if they collide
            if (time != null && time >= 0 && time <= timeProportion){
                let leftObjectX = leftDetails["start_x"] + leftDetails["x_velocity"] * time + 1; // + 1 to make sure is enough to the right
                let leftObjectY = leftDetails["start_y"] + leftDetails["y_velocity"] * time + 0.5 * Math.pow(leftDetails["y_acceleration"], 2);
                let rightObjectX = rightDetails["start_x"] + rightDetails["x_velocity"] * time;
                let rightObjectY = rightDetails["start_y"] + rightDetails["y_velocity"] * time + 0.5 * Math.pow(rightDetails["y_acceleration"], 2);
                leftObject.update(leftObjectX, leftObjectY);
                rightObject.update(rightObjectX, rightObjectY);
                if (leftObject.collidesWith(rightObject)){
                    return true;
                }
            }
        }
        // This one isn't necessary but it just looks right to me
        {
            // Try the top/bottom collision
            let bottomObject = h1;
            let bottomDetails = h1Details;
            let topObject = h2;
            let topDetails = h2Details;
            if (h2Details["start_y"] - h2.getRadiusEquivalentY() < h1Details["start_y"] - h1.getRadiusEquivalentY()){
                bottomObject = h2;
                bottomDetails = h2Details;
                topObject = h1;
                topDetails = h1Details;
            }

            /* Calculations
                bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
                topObjectBottomEnd = topObject.getCenterY() - bottomObject.getRadiusEquivalentY();
                bottomObjectTopEnd + bottomObjectVY * time + 0.5 * bottomObjectAcceleration * time^2 = topObjectBottomEnd + topObjectVY * time + 0.5 * topObjectAcceleration * time^2 
                0 = topObjectBottomEnd - bottomObjectTopEnd +  + 0.5 * topObjectAcceleration * time^2 - 0.5 * bottomObjectAcceleration * time^2
                0 = (topObjectAcceleration - bottomObjectAcceleration) * time^2 + (topObjectVY- bottomObjectVY) * time + (topObjectBottomEnd - bottomObjectTopEnd)
                0 = ax^2 + bx + c where:
                    a = (topObjectAcceleration - bottomObjectAcceleration)
                    b = (topObjectVY- bottomObjectVY)
                    c = (topObjectBottomEnd - bottomObjectTopEnd)
                    x = time
                Enter quadratic equation (use plus because future?)
                time = -1 * b + sqrt(b^2 - 4 * a * c) / (2 * a)
            */
            let bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
            let topObjectBottomEnd = topObject.getCenterY() - topObject.getRadiusEquivalentY();
            let a = topDetails["y_acceleration"] - bottomDetails["y_acceleration"];
            let b = topDetails["y_velocity"] - bottomDetails["y_velocity"];
            let c = topObjectBottomEnd - bottomObjectTopEnd;
            let x = safeDivide(-1 * (b) + Math.sqrt(Math.pow(b,2) - 4 * a * c), 2 * a, 0.0000001, null);
            let time = x;
            /* Eypected values for time:
                null - Denominator close to zero
                < 0 - Never collide in y
                > 0 <= timeProportion - Collide in y at a reasonable time
                > 0 > timeProportion - Collide later on (assuming 0 acceleration)
            */
            // If time is reasonable then compute their locations and see if they collide
            if (time != null && time >= 0 && time <= timeProportion){
                let bottomObjectY = bottomDetails["start_y"] + bottomDetails["y_velocity"] * time + 1; // + 1 to make sure is enough to the top
                let bottomObjectX = bottomDetails["start_x"] + bottomDetails["x_velocity"] * time + bottomDetails["y_velocity"] * time + 0.5 * Math.pow(bottomDetails["y_acceleration"], 2);
                let topObjectX = topDetails["start_x"] + topDetails["x_velocity"] * time;
                let topObjectY = topDetails["start_y"] + topDetails["y_velocity"] * time + topDetails["y_velocity"] * time + 0.5 * Math.pow(topDetails["y_acceleration"], 2);
                bottomObject.update(bottomObjectX, bottomObjectY);
                topObject.update(topObjectX, topObjectY);
                if (bottomObject.collidesWith(topObject)){
                    return true;
                }
            }
        }

        return false;
    }
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = SimpleProjectile;
}