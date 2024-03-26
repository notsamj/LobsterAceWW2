// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("./entity.js");
}
/*
    Class Name: Bullet
    Description: Bullet shot from a plane
    TODO: Comments
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
        this.startX = x;
        this.startY = y;
        angle = toRadians(angle); // Convert the angle to radians so it can be used in calculations
        this.spawnedTick = this.scene.getGamemode().getNumTicks();
        this.yVI = yVelocity + Math.sin(angle) * PROGRAM_DATA["bullet_data"]["speed"];
        this.xVelocity = xVelocity + Math.cos(angle) * PROGRAM_DATA["bullet_data"]["speed"];
        this.hitBox = new CircleHitbox(PROGRAM_DATA["bullet_data"]["radius"]);
        this.shooterClass = shooterClass;
        this.shooterID = shooterID;
        this.index = null;
    }

    getInterpolatedX(){
        return this.interpolatedX;
    }

    getInterpolatedY(){
        return this.interpolatedY;
    }

    getX(){
        return this.getXAtTick(this.scene.getGamemode().getNumTicks());
    }

    getXAtTick(tick){
        return this.startX + this.xVelocity * ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
    }

    getGameDisplayX(tick, currentTime){
        return this.getXAtTick(tick) + this.xVelocity * (currentTime - this.scene.getGamemode().getLastTickTime()) / 1000;
    }

    getY(){
        return this.getYAtTick(this.scene.getGamemode().getNumTicks());
    }

    getYAtTick(tick){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
        return this.startY + this.yVI * seconds - 0.5 * PROGRAM_DATA["constants"]["gravity"] * Math.pow(seconds, 2);
    }

    getYVelocity(){
        let tick = this.scene.getGamemode().getNumTicks();
        return this.getYVelocityAtTick(tick);
    }

    getYVelocityAtTick(tick){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
        return this.vYI - PROGRAM_DATA["constants"]["gravity"] * seconds;
    }

    getGameDisplayY(tick, currentTime){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"])) + (currentTime - this.scene.getGamemode().getLastTickTime()) / 1000;
        return this.startY + this.yVI * seconds - 0.5 * PROGRAM_DATA["constants"]["gravity"] * Math.pow(seconds, 2);
    }

    getYVelocityAtTick(){

    }

    calculateInterpolatedCoordinates(currentTime){
        this.interpolatedX = this.getGameDisplayX(this.scene.getGamemode().getNumTicks(), currentTime);
        this.interpolatedY = this.getGameDisplayY(this.scene.getGamemode().getNumTicks(), currentTime);
    }

    /*
        Method Name: setIndex
        Method Parameters:
            index:
                Index of the bullet in the bullet array
        Method Description: Setter
        Method Return: void
    */
    setIndex(index){
        this.index = index;
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
        return getImage("bullet");
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
        Method Name: expectedToDie
        Method Parameters: None
        Method Description: Determine if the bullet is too far away from the other planes that its effectively dead
        Method Return: boolean, true if expected to die, false otherwise
    */
    expectedToDie(){
        let belowGround = this.getY() < 0;
        // TODO: Change this!!! (yVelocity no longer exists)
        let yVelocity = this.getYVelocity();
        let movingDownTooFast = yVelocity < 0 && Math.abs(yVelocity) > PROGRAM_DATA["settings"]["expected_canvas_height"] * PROGRAM_DATA["settings"]["max_bullet_y_velocity_multiplier"] * PROGRAM_DATA["bullet_data"]["speed"];
        if (movingDownTooFast || belowGround){ return true; }
        return false;
        
        // TODO: Do this elsewhere because this is wasteful to do for each bullet
        /*
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
        
        let tooFarToTheLeftOrRight = maxX != null && (this.x + PROGRAM_DATA["settings"]["expected_canvas_width"] < minX || this.x - PROGRAM_DATA["settings"]["expected_canvas_width"] > maxX);
        let tooFarToUpOrDown = maxY != null && (this.y + PROGRAM_DATA["settings"]["expected_canvas_height"] < minY || this.y - PROGRAM_DATA["settings"]["expected_canvas_height"] > maxY);
        return tooFarToTheLeftOrRight || tooFarToUpOrDown;
        */
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
        // Shouldn't happen?
        debugger;
        return Bullet.hitInTime(this.getHitbox(), this.x, this.y, this.getXVelocity(), this.getYVelocity(), otherEntity.getHitbox(), otherEntity.getX(), otherEntity.getY(), otherEntity.getXVelocity(), otherEntity.getYVelocity(), timeDiff/1000);
    }

    /*
        Method Name: collidesWithPlane
        Method Parameters:
            plane:
                A plane to check for a collision with
            timeDiff:
                The time length of a tick
            simpleBulletData:
                Some simple information about this bullet
            simplePlaneData:
                Some simple information about the plane
        Method Description: Checks for a collision between this bullet and a plane
        Method Return: Boolean, true -> collides, false -> does not collide
    */
    collidesWithPlane(plane, timeDiff, simpleBulletData, simplePlaneData){
        let h1 = this.getHitbox();
        let h2 = plane.getHitbox();

        // Quick checks

        // If plane right < bullet left
        if (simplePlaneData["rX"] + h2.getRadiusEquivalentX() < simpleBulletData["lX"] - h1.getRadiusEquivalentX()){
            return false;
        }

        // If plane left > bullet right
        if (simplePlaneData["lX"] - h2.getRadiusEquivalentX() > simpleBulletData["rX"] + h1.getRadiusEquivalentX()){
            return false;
        }

        // If plane top < bullet bottom
        if (simplePlaneData["tY"] + h2.getRadiusEquivalentX() < simpleBulletData["bY"] - h1.getRadiusEquivalentX()){
            return false;
        }

         // If plane bottom > bullet top
        if (simplePlaneData["bY"] - h2.getRadiusEquivalentX() > simpleBulletData["tY"] + h1.getRadiusEquivalentX()){
            return false;
        }

        // Need further checking
        return Bullet.checkForProjectileLinearCollision(this, plane, this.scene.getGamemode().getNumTicks()-1);

        /*
        TODO: This is the old code
        let timeProportion = timeDiff / 1000;
        let h1X = this.x;
        let h1Y = this.y;
        let h1VX = this.getXVelocity();
        let h1VY = this.getYVelocity();

        let h2X = plane.getX();
        let h2Y = plane.getY();
        let h2VX = plane.getXVelocity();
        let h2VY = plane.getYVelocity();

        // More complex checks
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
            if (h2X - h2.getRadiusEquivalentX() < h1X - h1.getRadiusEquivalentX()){
                leftObject = h2;
                leftDetails = h2Details;
                rightObject = h1;
                rightDetails = h1Details;
            }

            * Calculations
                leftObjectRightEnd = leftObject.getCenterX() + leftObject.getRadiusEquivalentX();
                rightObjectLeftEnd = rightObject.getCenterX() - leftObject.getRadiusEquivalentX();
                leftObjectRightEnd + leftObjectVX * time = rightObjectLeftEnd + rightObjectVX * time
                leftObjectRightEnd - rightObjectLeftEnd = (rightObjectVX - leftObjectVX) * time
                time = (leftObjectRightEnd - rightObjectLeftEnd) / (rightObjectVX - leftObjectVX)
            *
            let leftObjectRightEnd = leftObject.getCenterX() + leftObject.getRadiusEquivalentX();
            let rightObjectLeftEnd = rightObject.getCenterX() - rightObject.getRadiusEquivalentX();
            let time = safeDivide(leftObjectRightEnd - rightObjectLeftEnd, rightDetails["x_velocity"] - leftDetails["x_velocity"], 0.0000001, null);
            * Expected values for time:
                null - Denominator close to zero
                < 0 - Never collide in x
                > 0 <= timeProportion - Collide in x at a reasonable time
                > 0 > timeProportion - Collide later on (assuming 0 acceleration)
            *
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

            * Calculations
                bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
                topObjectBottomEnd = topObject.getCenterY() - bottomObject.getRadiusEquivalentY();
                bottomObjectTopEnd + bottomObjectVY * time = topObjectBottomEnd + topObjectVY * time
                bottomObjectTopEnd - topObjectBottomEnd = (topObjectVY - bottomObjectVY) * time
                time = (bottomObjectTopEnd - topObjectBottomEnd) / (topObjectVY - bottomObjectVY)
            *
            let bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
            let topObjectBottomEnd = topObject.getCenterY() - topObject.getRadiusEquivalentY();
            let time = safeDivide(bottomObjectTopEnd - topObjectBottomEnd, topDetails["y_velocity"] - bottomObject["y_velocity"], 0.0000001, null);
            * Eypected values for time:
                null - Denominator close to zero
                < 0 - Never collide in y
                > 0 <= timeProportion - Collide in y at a reasonable time
                > 0 > timeProportion - Collide later on (assuming 0 acceleration)
            *
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
        */
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
            displayTime:
                The time that the frame is being displayed
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        // Note: For this and bomb this code isn't perfect because it doesn't consider interpolated location
        this.calculateInterpolatedCoordinates(displayTime);
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.scene.getDisplayX(this.interpolatedX, this.getWidth(), lX);
        let displayY = this.scene.getDisplayY(this.interpolatedY, this.getHeight(), bY);
        drawingContext.drawImage(this.getImage(), displayX, displayY); 
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the bullet
        Method Return: JSON object
    */
    toJSON(){
        return {
            "start_x": this.startX,
            "start_y": this.startY,
            "dead": this.isDead(),
            "x_velocity": this.xVelocity,
            "initial_y_velocity": this.yVI,
            "spawned_tick": this.spawnedTick,
            "shooter_class": this.shooterClass,
            "shooter_id": this.shooterID,
            "index": this.index
        }
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
        Method Name: fromJSON
        Method Parameters:
            bulletJSONObject:
                Information about a bullet
        Method Description: Sets the attributes of a bullet from a json representation
        Method Return: void
    */
    fromJSON(bulletJSONObject, force=false){
        // Don't overwrite a living bullet
        // TODO: Local still kills bullets even without collision right?
        if (!this.isDead() && !force){ 
            return; 
        }
        // No need to taken info from a dead bullet
        if (bulletJSONObject["dead"]){ return; }
        this.dead = false;
        this.startX = jsonRepresentation["start_x"];
        this.startY = jsonRepresentation["start_y"];
        this.spawnedTick = jsonRepresentation["spawned_tick"];
        this.yVI = jsonRepresentation["initial_y_velocity"];
        this.xVelocity = jsonRepresentation["x_velocity"];
        this.shooterClass = bulletJSONObject["shooter_class"];
        this.shooterID = bulletJSONObject["shooter_id"];
        this.index = bulletJSONObject["index"];
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            bulletJSONObject:
                Information about a bullet
            scene:
                The scene that the bullet is a part of
        Method Description: Creates a bullet from a representation
        Method Return: JSON Object
    */
    static fromJSON(bulletJSONObject, scene){
        let x = bulletJSONObject["start_x"];
        let y = bulletJSONObject["start_y"];
        let bullet = new Bullet(x, y, scene, 0, 0, 0, bulletJSONObject["shooter_id"], bulletJSONObject["shooter_class"]);
        bullet.setDead(bulletJSONObject["dead"]);
        bullet.fromJSON(bulletJSONObject, true);
        return bullet;
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
    /*static hitInTime(h1, h1X, h1Y, h1VX, h1VY, h2, h2X, h2Y, h2VX, h2VY, timeProportion){
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

            * Calculations
                leftObjectRightEnd = leftObject.getCenterX() + leftObject.getRadiusEquivalentX();
                rightObjectLeftEnd = rightObject.getCenterX() - leftObject.getRadiusEquivalentX();
                leftObjectRightEnd + leftObjectVX * time = rightObjectLeftEnd + rightObjectVX * time
                leftObjectRightEnd - rightObjectLeftEnd = (rightObjectVX - leftObjectVX) * time
                time = (leftObjectRightEnd - rightObjectLeftEnd) / (rightObjectVX - leftObjectVX)
            *
            let leftObjectRightEnd = leftObject.getCenterX() + leftObject.getRadiusEquivalentX();
            let rightObjectLeftEnd = rightObject.getCenterX() - rightObject.getRadiusEquivalentX();
            let time = safeDivide(leftObjectRightEnd - rightObjectLeftEnd, rightDetails["x_velocity"] - leftDetails["x_velocity"], 0.0000001, null);
            * Expected values for time:
                null - Denominator close to zero
                < 0 - Never collide in x
                > 0 <= timeProportion - Collide in x at a reasonable time
                > 0 > timeProportion - Collide later on (assuming 0 acceleration)
            *
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

            * Calculations
                bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
                topObjectBottomEnd = topObject.getCenterY() - bottomObject.getRadiusEquivalentY();
                bottomObjectTopEnd + bottomObjectVY * time = topObjectBottomEnd + topObjectVY * time
                bottomObjectTopEnd - topObjectBottomEnd = (topObjectVY - bottomObjectVY) * time
                time = (bottomObjectTopEnd - topObjectBottomEnd) / (topObjectVY - bottomObjectVY)
            *
            let bottomObjectTopEnd = bottomObject.getCenterY() + bottomObject.getRadiusEquivalentY();
            let topObjectBottomEnd = topObject.getCenterY() - topObject.getRadiusEquivalentY();
            let time = safeDivide(bottomObjectTopEnd - topObjectBottomEnd, topDetails["y_velocity"] - bottomObject["y_velocity"], 0.0000001, null);
            * Eypected values for time:
                null - Denominator close to zero
                < 0 - Never collide in y
                > 0 <= timeProportion - Collide in y at a reasonable time
                > 0 > timeProportion - Collide later on (assuming 0 acceleration)
            *
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
    }*/

    static checkForProjectileLinearCollision(projectile, linearMovingObject, previousTick){
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
        h2.update(h1Details["start_x"], h1Details["start_y"]);

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
            if (h2Y - h2.getRadiusEquivalentY() < h1Y - h1.getRadiusEquivalentY()){
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
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = Bullet;
}