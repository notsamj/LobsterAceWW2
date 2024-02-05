// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("../scripts/entity.js");
}
/*
    Class Name: Bullet
    Description: Bullet shot from a plane
*/
class Bullet extends Entity {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The starting x position of the bullet
            y:
                The starting y position of the bullet
            scene:
                A Scene object related to the fighter plane
            xVelocity:
                The starting x velocity of the bullet
            yVelocity:
                The starting y velocity of the bullet
            angle:
                The angle of the bullet's trajectory
            shooterID:
                The id of the plane that shot the bullet
            shooterClass:
                The type of plane that shot the bullet
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, scene, xVelocity, yVelocity, angle, shooterID, shooterClass){
        super(scene);
        this.x = x;
        this.y = y;
        angle = toRadians(angle); // Convert the angle to radians so it can be used in calculations
        this.yVelocity = yVelocity + Math.sin(angle) * FILE_DATA["bullet_data"]["speed"];
        this.xVelocity = xVelocity + Math.cos(angle) * FILE_DATA["bullet_data"]["speed"];
        this.hitBox = new CircleHitbox(FILE_DATA["bullet_data"]["radius"]);
        this.shooterClass = shooterClass;
        this.shooterID = shooterID;
    }

    /*
        Method Name: tick
        Method Parameters:
            timePassed:
                The time between ticks (in MS)
        Method Description: Determine movement and death each tick
        Method Return: void
    */
    tick(timePassed){
        let timeProportion = timePassed / 1000; // Proportion of a second
        let yAcceleration = FILE_DATA["constants"]["GRAVITY"] * timeProportion;

        // Apply acceleration
        this.yVelocity = this.yVelocity - yAcceleration;
        this.x += this.xVelocity * timeProportion;
        this.y += this.yVelocity * timeProportion;

        // If below ground or too fast or too far away from planes to matter
        if (this.expectedToDie()){
            this.die();
            return;
        }
    }

    /*
        Method Name: getAlliance
        Method Parameters: None
        Method Description: Determine movement and death each tick
        Method Return: String, alliance name
    */
    getAlliance(){
        return planeModelToAlliance(this.shooterClass);
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Provide the width of the bullet image
        Method Return: Integer
    */
    getWidth(){
        return this.getImage().width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Provide the height of the bullet image
        Method Return: Integer
    */
    getHeight(){
        return this.getImage().height;
    }

    /*
        Method Name: getImage
        Method Parameters: None
        Method Description: Provide the bullet image
        Method Return: Image
    */
    getImage(){
        return images["bullet"];
    }

    /*
        Method Name: getHitbox
        Method Parameters: None
        Method Description: Provide the hitbox (updated with the current bullet position)
        Method Return: Hitbox
    */
    getHitbox(){
        this.hitBox.update(this.x, this.y);
        return this.hitBox;
    }

    /*
        Method Name: getShooterID
        Method Parameters: None
        Method Description: Provide the ID of the bullet's shooter
        Method Return: String
    */
    getShooterID(){
        return this.shooterID;
    }

    /*
        Method Name: getShooterClass
        Method Parameters: None
        Method Description: Provide the type of plane that shot the bullet
        Method Return: Provide
    */
    getShooterClass(){
        return this.shooterClass;
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
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Provide the current y velocity of the bullet
        Method Return: float
    */
    getYVelocity(){
        return this.yVelocity;
    }

    /*
        Method Name: expectedToDie
        Method Parameters: None
        Method Description: Determine if the bullet is too far away from the other planes that its effectively dead
        Method Return: boolean, true if expected to die, false otherwise
    */
    expectedToDie(){
        let belowGround = this.y < 0;
        let movingDownTooFast = this.yVelocity < 0 && Math.abs(this.yVelocity) > FILE_DATA["constants"]["EXPECTED_CANVAS_HEIGHT"] * FILE_DATA["constants"]["MAX_BULLET_Y_VELOCITY_MULTIPLIER"] * FILE_DATA["bullet_data"]["speed"];
        if (movingDownTooFast || belowGround){ return true; }
        let maxX = null;
        let maxY = null;
        let minX = null;
        let minY = null;
        // Look through all the planes to determine the minX, maX of any plane
        for (let fighterPlane of this.scene.getPlanes()){
            let x = fighterPlane.getX();
            let y = fighterPlane.getY();
            if (maxX == null){
                maxX = x;
                minX = x;
                minY = y;
                maxY = y;
                continue;
            }
            maxX = Math.max(maxX, x);
            minX = Math.min(minX, x);
            maxY = Math.max(maxY, y);
            minY = Math.min(minY, y);
        }
        let tooFarToTheLeftOrRight = maxX != null && (this.x + FILE_DATA["constants"]["EXPECTED_CANVAS_WIDTH"] < minX || this.x - FILE_DATA["constants"]["EXPECTED_CANVAS_WIDTH"] > maxX);
        let tooFarToUpOrDown = maxY != null && (this.y + FILE_DATA["constants"]["EXPECTED_CANVAS_HEIGHT"] < minY || this.y - FILE_DATA["constants"]["EXPECTED_CANVAS_HEIGHT"] > maxY);
        return tooFarToTheLeftOrRight || tooFarToUpOrDown;
    }

    /*
        Method Name: collidesWith
        Method Parameters:
            otherEntity:
                An entity that the bullet might collide with
            timeDiff:
                The time passed between two ticks
        Method Description: Checks if the bullet collides with another entity
        Method Return: boolean, true if collides, false otherwise
    */
    collidesWith(otherEntity, timeDiff){
        return hitInTime(this.getHitbox(), this.x, this.y, this.getXVelocity(), this.getYVelocity(), otherEntity.getHitbox(), otherEntity.getX(), otherEntity.getY(), otherEntity.getXVelocity(), otherEntity.getYVelocity(), timeDiff/1000);
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.getDisplayX(this.getCenterX(), this.getWidth(), lX);
        let displayY = this.getDisplayY(this.getCenterY(), this.getHeight(), bY);
        drawingContext.drawImage(entity.getImage(), displayX, displayY); 
    }
}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = Bullet;
}
/*
    Method Name: hitInTime
    Method Parameters:
        h1:
            Hitbox of object 1
        h1X:
            Starting x of object 1
        h1Y:
            Starting y of object 1
        h1VX:
            Starting x velocity of object 1
        h1VY:
            Starting y velocity of object 1
        h2:
            Hitbox of object 2
        h2X:
            Starting x of object 2
        h2Y:
            Starting y of object 2
        h2VX:
            Starting x velocity of object 2
        h2VY:
            Starting y velocity of object 2
        timeProportion:
            Proportion of time over which to check (example: if velocity is 1m/s then timeProption will be [0,Infinity] in the unit m/s so if timeProportion is 1 then an object with 1m/s velocity will move 1 meter)
    Method Description: Determine if two objects collide within a given time frame
    Method Return: boolean, true if collide, false if don't collide
    Note: 
        - May expand hitboxes by up to 1 pixel.
        - Doesn't seem to be performing better experimentally than the old function but it should be better in theory
*/
function hitInTime(h1, h1X, h1Y, h1VX, h1VY, h2, h2X, h2Y, h2VX, h2VY, timeProportion){
    let h1Details = {
        "start_x": h1X,
        "start_y": h1Y,
        "x_velocity": h1VX,
        "y_velocity": h1VY 
    }
    let h2Details = {
        "start_x": h2X,
        "start_y": h2Y,
        "x_velocity": h2VX,
        "y_velocity": h2VY 
    }
    // Update the hitboxes to the starting locations
    h1.update(h1X, h1Y);
    h2.update(h2X, h2Y);

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
        if (h2X - h2.getRadiusEquivalentX() < h1X - h1.getRadiusEquivalentX()){
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
        let rightObjectLeftEnd = rightObject.getCenterX() - leftObject.getRadiusEquivalentX();
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
            let leftObjectY = leftDetails["start_y"] + leftDetails["y_velocity"] * time;
            let rightObjectX = rightDetails["start_x"] + rightDetails["x_velocity"] * time;
            let rightObjectY = rightDetails["start_y"] + rightDetails["y_velocity"] * time;
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
        if (h2Y - h2.getRadiusEquivalentY() < h1Y - h1.getRadiusEquivalentY()){
            bottomObject = h2;
            bottomDetails = h2Details;
            topObject = h1;
            topDetails = h1Details;
        }

        /* Calculations
            bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
            topObjectBottomEnd = topObject.getCenterY() - bottomObject.getRadiusEquivalentY();
            bottomObjectTopEnd + bottomObjectVY * time = topObjectBottomEnd + topObjectVY * time
            bottomObjectTopEnd - topObjectBottomEnd = (topObjectVY - bottomObjectVY) * time
            time = (bottomObjectTopEnd - topObjectBottomEnd) / (topObjectVY - bottomObjectVY)
        */
        let bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
        let topObjectBottomEnd = topObject.getCenterY() - bottomObject.getRadiusEquivalentY();
        let time = safeDivide(bottomObjectTopEnd - topObjectBottomEnd, topDetails["y_velocity"] - bottomObject["y_velocity"], 0.0000001, null);
        /* Eypected values for time:
            null - Denominator close to zero
            < 0 - Never collide in y
            > 0 <= timeProportion - Collide in y at a reasonable time
            > 0 > timeProportion - Collide later on (assuming 0 acceleration)
        */
        // If time is reasonable then compute their locations and see if they collide
        if (time != null && time >= 0 && time <= timeProportion){
            let bottomObjectY = bottomDetails["start_y"] + bottomDetails["y_velocity"] * time + 1; // + 1 to make sure is enough to the top
            let bottomObjectX = bottomDetails["start_x"] + bottomDetails["x_velocity"] * time;
            let topObjectX = topDetails["start_x"] + topDetails["x_velocity"] * time;
            let topObjectY = topDetails["start_y"] + topDetails["y_velocity"] * time;
            bottomObject.update(bottomObjectX, bottomObjectY);
            topObject.update(topObjectX, topObjectY);
            if (bottomObject.collidesWith(topObject)){
                return true;
            }
        }
    }

    return false;
}