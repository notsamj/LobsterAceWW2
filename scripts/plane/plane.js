// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("../scripts/entity.js");
    PROGRAM_DATA = require("../data/data_json.js");
    CircleHitbox = require("../scripts/hitboxes.js").CircleHitbox;
    toRadians = require("../scripts/helper_functions.js").toRadians;
}
/*
    Class Name: Plane
    Description: A subclass of the Entity that represents a general plane
*/
class Plane extends Entity {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(scene);
        this.planeClass = planeClass;
        this.facingRight = facingRight;
        this.angle = angle;
        this.throttle = PROGRAM_DATA["settings"]["max_throttle"];
        this.maxSpeed = PROGRAM_DATA["plane_data"][planeClass]["max_speed"];
        this.speed = this.maxSpeed;
        this.hitBox = new CircleHitbox(PROGRAM_DATA["plane_data"][planeClass]["radius"]);
        this.health = PROGRAM_DATA["plane_data"][planeClass]["health"];
        this.startingHealth = this.health;
        this.throttleConstant = Math.sqrt(this.maxSpeed) / PROGRAM_DATA["settings"]["max_throttle"];
        this.decisions = {
            "face": 0, // 1 -> right, -1 -> left, 0 -> no change
            "angle": 0, // 1 -> ccw by 1 deg, -1 -> cw by 1 deg, 0 -> no change
            "throttle": 0, // 1 -> up by 1 deg, -1 -> down by 1 deg, 0 -> no change
            "shoot": false, // true -> shoot, false -> don't shoot
        }
    }

    // Abstract
    toJSON(){}

    /*
        Method Name: getStartingHealth
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getStartingHealth(){
        return this.startingHealth;
    }

    /*
        Method Name: setStartingHealth
        Method Parameters:
            startingHealth:
                The starting health of the plane
        Method Description: Setter
        Method Return: void
    */
    setStartingHealth(startingHealth){
        this.startingHealth = startingHealth;
    }

    /*
        Method Name: onSameTeam
        Method Parameters: otherPlane
        Method Description: Determine if this plane is on the same team as another plane
        Method Return: True if the planes are on the same team, false otherwise
    */
    onSameTeam(otherPlane){
        return onSameTeam(this.getPlaneClass(), otherPlane.getPlaneClass());
    }

    /*
        Method Name: toString
        Method Parameters: None
        Method Description: Creates a string representation of the plane
        Method Return: void
    */
    toString(){
        return `"Model: ${this.planeClass}\nFacing Right: ${this.facingRight}\nAngle: ${this.angle}\nHealth: ${this.health}`;
    }

    /*
        Method Name: getPlaneClass
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getPlaneClass(){
        return this.planeClass;
    }

    /*
        Method Name: getModel
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getModel(){
        return this.getPlaneClass();
    }

    /*
        Method Name: goodToFollow
        Method Parameters: None
        Method Description: Provides the information that this object is "good to follow"
        Method Return: boolean, true -> good to follow, false -> not good to follow
    */
    goodToFollow(){ return true; }

    /*
        Method Name: getSmokeNumber
        Method Parameters: None
        Method Description: Provides information about what state of decay the plane is in
        Method Return: an integer number in range [0, Number of smoke images]
    */
    getSmokeNumber(){
        let hpMissingProportion = (this.startingHealth - this.health) / this.startingHealth;
        let phaseTotal = PROGRAM_DATA["smoke_images"].length + 1;
        let phaseIntervalSize = 1 / phaseTotal;
        let smokeNumber = Math.floor(hpMissingProportion / phaseIntervalSize);
        return smokeNumber;
    }

    /*
        Method Name: isSmoking
        Method Parameters: None
        Method Description: Determines if the plane is damaged enough to start smoking
        Method Return: Boolean, true -> smoking, false -> not smoking
    */
    isSmoking(){
        return this.getSmokeNumber() > 0;
    }

    /*
        Method Name: getSmokeImage
        Method Parameters: None
        Method Description: Finds the appropriate smoke image for a plane
        Method Return: Image
        Note: Assumes smoke number is in range [1,MAX_SMOKE_NUMBER]
    */
    getSmokeImage(){
        return images["smoke_" + this.getSmokeNumber()];
    }

    /*
        Method Name: canRotate
        Method Parameters: None
        Method Description: Indicates that fighter planes can rotate
        Method Return: Boolean, true -> can rotate, false -> cannot rotate
    */
    canRotate(){
        return true;
    }

    /*
        Method Name: setHealth
        Method Parameters:
            health:
                integer representing plane health
        Method Description: Setter
        Method Return: void
    */
    setHealth(health){
        this.health = health;
    }

    /*
        Method Name: setThrottle
        Method Parameters:
            throttle:
                integer representing plane throttle
        Method Description: Setter
        Method Return: void
    */
    setThrottle(throttle){
        this.throttle = throttle;
    }

    /*
        Method Name: setSpeed
        Method Parameters:
            speed:
                integer representing plane speed
        Method Description: Setter
        Method Return: void
    */
    setSpeed(speed){
        this.speed = speed;
    }

    /*
        Method Name: setAngle
        Method Parameters:
            angle:
                Integer in range [0,359], the plane's angle
        Method Description: Setter
        Method Return: void
    */
    setAngle(angle){
        this.angle = angle;
    }

    /*
        Method Name: getAngle
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer in range [0,359]
    */
    getAngle(){
        return this.angle;
    }

    /*
        Method Name: isFacingRight
        Method Parameters: None
        Method Description: Indicates the orientation of the plane
        Method Return: Boolean, true -> Facing right, false -> Facing left
    */
    isFacingRight(){
        return this.facingRight;
    }
    
    /*
        Method Name: damage
        Method Parameters: 
            amount:
                Amount to damage the plane, Integer
        Method Description: Damages a plane and kills it if damage causes plane to end up with 0 or less health
        Method Return: void
    */
    damage(amount){
        this.scene.getSoundManager().play("damage", this.x, this.y);
        this.health -= amount * PROGRAM_DATA["settings"]["bullet_reduction_coefficient"];
        if (this.health <= 0){
            this.scene.getSoundManager().play("explode", this.x, this.y);
            this.die();
        }
    }

    /*
        Method Name: getHitbox
        Method Parameters: None
        Method Description: Getter, first updates the hitbox to reflect current plane location
        Method Return: Hitbox
    */
    getHitbox(){
        this.hitBox.update(this.x, this.y);
        return this.hitBox;
    }

    /*
        Method Name: getMaxSpeed
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getMaxSpeed(){
        return this.maxSpeed;
    }

    /*
        Method Name: adjustAngle
        Method Parameters:
            amount:
                Amount to change the angle (and also the direction [pos/neg])
        Method Description: Change the angle of the plane
        Method Return: void
    */
    adjustAngle(amount){
        let newAngle = this.angle;
        if (this.throttle == 0){ return; }

        // Determine angle
        if (this.facingRight){
            newAngle += amount;
        }else{
            newAngle -= amount;
        }

        // Ensure the angle is between 0 and 360
        while(newAngle >= 360){
            newAngle -= 360;
        }
        while(newAngle < 0){
            newAngle += 360;
        }
        this.angle = Math.floor(newAngle);
    }

    /*
        Method Name: adjustAngle
        Method Parameters:
            facingRight:
                New orientation for the plane
        Method Description: Change the orientation of the plane
        Method Return: void
    */
    face(facingRight){
        // If not switching directions nothing to do
        if (facingRight == this.facingRight){
            return;
        }
        if (this.throttle == 0){ return; }
        let newAngle = fixDegrees(360 - this.angle);
        this.angle = newAngle;
        this.facingRight = facingRight;
        this.speed *= (1 - PROGRAM_DATA["settings"]["slow_down_amount"]);
    }

    /*
        Method Name: setFacingRight
        Method Parameters:
            facingRight:
                Boolean, true -> plane is facing right, false -> plane is facing left
        Method Description: Setter
        Method Return: void
    */
    setFacingRight(facingRight){
        this.facingRight = facingRight;
    }

    /*
        Method Name: getCurrentImage
        Method Parameters: None
        Method Description: Determine the current image of the plane (relic of when planes had 720 images)
        Method Return: Image
    */
    getCurrentImage(){
        return images[this.getImageIdentifier()];
    }

    /*
        Method Name: getImage
        Method Parameters: None
        Method Description: Determine the current image of the plane (relic of when planes had 720 images)
        Method Return: Image
    */
    getImage(){
        return this.getCurrentImage();
    }

    /*
        Method Name: getImageIdentifier
        Method Parameters: None
        Method Description: Determine the name of the image of the plane (relic of when planes had 720 images)
        Method Return: String
    */
    getImageIdentifier(){
        return this.getPlaneClass();
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Determine the width of the current plane image
        Method Return: int
    */
    getWidth(){
        return this.getCurrentImage().width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Determine the height of the current plane image
        Method Return: int
    */
    getHeight(){
        return this.getCurrentImage().height;
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiffMS:
                The time between ticks
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(timeDiffMS){
        this.makeDecisions();
        this.executeDecisions();
        let timeProportion = (timeDiffMS / 1000);

        // Throttle - Drag
        let throttleAcc = this.throttle * this.throttleConstant;
    
        // Drag
        let dragAcc = Math.sqrt(Math.abs(this.speed));

        let acceleration = throttleAcc - dragAcc;

        // Speed
        this.speed += acceleration * timeProportion;
        this.speed = Math.max(this.speed, 0);

        // Finally the position
        
        // Handle zero throttle
        if (this.throttle > 0){
            this.y += this.getYVelocity() * timeProportion;
        }else{
            this.y -= PROGRAM_DATA["settings"]["fall_speed"] * timeProportion;
        }
        
        // If hit the ground
        if (this.y - this.hitBox.getRadiusEquivalentY() <= 0){
            this.die();
        }
        this.x += this.getXVelocity() * timeProportion;
        this.scene.getSoundManager().play("engine", this.x, this.y);
    }

    // Abstract
    makeDecisions(){}

    // Abstract
    executeDecisions(){}

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Determine the x velocity of the plane at the moment
        Method Return: float
    */
    getXVelocity(){
        let effectiveAngle = this.getEffectiveAngle();
        let cosAngle = Math.cos(toRadians(effectiveAngle));
        if (this.throttle == 0){ return 0; }
        return this.speed * cosAngle * (!this.facingRight ? -1 : 1);
    }

    /*
        Method Name: getEffectiveAngle
        Method Parameters: None
        Method Description: 
        Determine the effective angle of the plane at the moment, 
        if facing left must be changed to match what it would be if facing right
        Method Return: int in range [0,360]
    */
    getEffectiveAngle(){
        let effectiveAngle = this.angle;
        if (!this.facingRight){
            effectiveAngle = fixDegrees(360 - effectiveAngle);
        }
        return effectiveAngle;
    }

    /*
        Method Name: getNoseAngle
        Method Parameters: None
        Method Description: 
        Determine the angle at which bullets shoot out of the plane
        Method Return: int in range [0,360]
    */
    getNoseAngle(){
        return fixDegrees(this.angle + (this.facingRight ? 0 : 180));
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Determine the y velocity of the plane at the moment
        Method Return: float
    */
    getYVelocity(){
        let effectiveAngle = this.getEffectiveAngle();
        let sinAngle = Math.sin(toRadians(effectiveAngle))
        return this.speed * sinAngle;
    }

    /*
        Method Name: getSpeed
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getSpeed(){
        return this.speed;
    }

    /*
        Method Name: getThrottle
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer in range [0,100]
    */
    getThrottle(){
        return this.throttle;
    }

    /*
        Method Name: adjustThrottle
        Method Parameters:
            amt:
                Amount by which the throttle is changed (can be pos/neg)
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    adjustThrottle(amt){
        this.throttle = Math.min(Math.max(0, this.throttle + amt), PROGRAM_DATA["settings"]["max_throttle"]);
    }

    /*
        Method Name: getHealth
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getHealth(){
        return this.health;
    }

    /*
        Method Name: setHealth
        Method Parameters:
            amount:
                New health amount
        Method Description: Setter
        Method Return: Integer
    */
    setHealth(amount){
        this.health = amount;
    }

    /*
        Method Name: isHuman
        Method Parameters: None
        Method Description: Determines whether the entity is controlled by a human.
        Method Return: boolean, true -> is controlled by a human, false -> is not controlled by a human
    */
    isHuman(){
        return false;
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
        let displayX = this.scene.getDisplayX(this.getCenterX(), this.getWidth(), lX);
        let displayY = this.scene.getDisplayY(this.getCenterY(), this.getHeight(), bY);

        // If dead then draw the explosion instead
        if (this.isDead()){
            scale(this.getWidth() / images["explosion"].width, this.getHeight() / images["explosion"].height);
            drawingContext.drawImage(images["explosion"], displayX  / (this.getWidth() / images["explosion"].width), displayY / (this.getHeight() / images["explosion"].height));
            scale(images["explosion"].width / this.getWidth(),images["explosion"].height / this.getHeight()); 
            return; 
        }

        // Find x and y of image given its rotation
        let rotateX = displayX + this.getWidth() / 2;
        let rotateY = displayY + this.getHeight() / 2;

        // Prepare the display
        translate(rotateX, rotateY);
        rotate(-1 * toRadians(this.getAngle()));
        // If facing left then turn around the display
        if (!this.isFacingRight()){
            scale(-1, 1);
        }

        // Display plane
        drawingContext.drawImage(this.getImage(), 0 - this.getWidth() / 2, 0 - this.getHeight() / 2); 

        // If facing left then turn around the display (reset)
        if (!this.isFacingRight()){
            scale(-1, 1);
        }
        // Reset the rotation and translation
        rotate(toRadians(this.getAngle()));
        translate(-1 * rotateX, -1 * rotateY);

        // If smoking then draw a smoke image overtop
        if (this.isSmoking()){
            // Prepare the display
            translate(rotateX, rotateY);
            rotate(-1 * toRadians(this.getAngle()));
            // If facing left then turn around the display
            if (!this.isFacingRight()){
                scale(-1 * this.getWidth() / this.getSmokeImage().width, this.getHeight() / this.getSmokeImage().height);
            }

            // Display smoke
            drawingContext.drawImage(this.getSmokeImage(), 0 - this.getWidth() / 2, 0 - this.getHeight() / 2); 

            // If facing left then turn around the display (reset)
            if (!this.isFacingRight()){
                scale(-1 * this.getSmokeImage().width / this.getWidth(), this.getSmokeImage().height / this.getHeight());
            }
            // Reset the rotation and translation
            rotate(toRadians(this.getAngle()));
            translate(-1 * rotateX, -1 * rotateY);
        }
    }

    /*
        Method Name: instantShot
        Method Parameters:
            gunX:
                The x location of the gun
            gunY:
                The y location of the gun
            angleDEG:
                The orientation of the gun
        Method Description: Shots the gun at a target in the direction its facing. The shot moves with infinite speed.
        Method Return: void
    */
    instantShot(gunX, gunY, angleDEG){
        // Determine if the plane is facing -x or +x (not proper if plane is perpenticular to the x axis)
        let xDir = (angleBetweenCCWDEG(angleDEG, 91, 269)) ? -1 : 1;
        if (angleDEG == 90 || angleDEG == 270){
            xDir = this.isFacingRight() ? 1 : -1;
        }

        // Determine if the plane is facing -y or +y (not proper if plane is perpenticular to the y axis)
        let yDir = (angleBetweenCCWDEG(angleDEG, 0, 180)) ? 1 : -1;

        let bestPlane = null;
        let bestDistance = null;
        // Find the best plane to shoot at
        for (let plane of scene.getPlanes()){
            // Check 1 - If the planes are on the same team then the shot won't hit this plane
            if (this.onSameTeam(plane)){ continue; }
            // Check 2 - If the plane located is in the correct x direction
            let planeHitbox = plane.getHitbox();
            planeHitbox.update(plane.getX(), plane.getY());
            // If the gun is shooting in a positive x direction
            if (xDir > 0){
                // If the gun is to the right of the right side of the enemy hitbox then definitely won't hit
                if (gunX > planeHitbox.getRightX()){
                    continue;
                }
            }else{ // If the gun is shooting in a negative x direction
                if (gunX < planeHitbox.getLeftX()){
                    continue;
                }
            }
            // Check 3 - If the plane located is in the correct y direction
            // If the gun is shooting in a positive y direction
            if (yDir > 0){
                // If the gun is above of the top side of the enemy hitbox (and facing up) then definitely won't hit
                if (gunY > planeHitbox.getTopY()){
                    continue;
                }
            }else{ // If the gun is shooting in a negative y direction
                if (gunY < planeHitbox.getBottomY()){
                    continue;
                }
            }
            // At this point the enemy plane is in the correct quadrant that the (this) plane is shooting in

            // I'm pretty sure that given what is known, just find closest plane and if it can be hit at the given angle it is the plane that gets hit
            let distance = plane.distanceToPoint(gunX, gunY);
            
            // If best distance plane is closer then this one is useless to look at further
            if (bestDistance != null && bestDistance < distance || distance > PROGRAM_DATA["settings"]["instant_shot_max_distance"]){
                continue;
            }

            // To check if the shot will hit this plane. Check if the shooting angle is between the angle to top of the plane and angle to bottom
            
            // Let theta represent the angle from the gun to the center of the enemy plane's hitbox
            let theta = displacementToDegrees(plane.getX() - gunX, plane.getY() - gunY);
            // Let alpha represent the maximum difference of angle allowed at the distance to hit the hitbox
            let alpha = fixDegrees(toDegrees(Math.asin(safeDivide(planeHitbox.getRadius(), distance, 1, 0))));
            // If the difference is too big then ignore
            if (calculateAngleDiffDEG(angleDEG, theta) > alpha){
                continue;
            }
            // Otherwise this is currently the plane that will be hit
            bestPlane = plane;
            bestDistance = distance;
        }

        // If we failed to find a plane getting shot then return
        if (bestPlane == null){ return; }
        // Hit the plane
        bestPlane.damage(1);
        if (bestPlane.isDead()){
            // Make a fake bullet just because that's how the handlekill function works
            let fauxBullet = new Bullet(null, null, null, null, null, null, this.getID(), null);
            scene.getTeamCombatManager().handleKill(fauxBullet, bestPlane);
        }
    }
}
// When this is opened in NodeJS, export the class
if (typeof window === "undefined"){
    module.exports = Plane;
}