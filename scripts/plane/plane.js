// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("../scripts/entity.js");
    FILE_DATA = require("../data/data_json.js");
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
        this.throttle = FILE_DATA["constants"]["MAX_THROTTLE"];
        this.maxSpeed = FILE_DATA["plane_data"][planeClass]["max_speed"];
        this.speed = this.maxSpeed;
        this.hitBox = new CircleHitbox(FILE_DATA["plane_data"][planeClass]["radius"]);
        this.health = FILE_DATA["plane_data"][planeClass]["health"];
        this.startingHealth = this.health;
        this.throttleConstant = Math.sqrt(this.maxSpeed) / FILE_DATA["constants"]["MAX_THROTTLE"];
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
        let phaseTotal = FILE_DATA["smoke_images"].length + 1;
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
        SOUND_MANAGER.play("damage", this.x, this.y);
        this.health -= amount * FILE_DATA["constants"]["BULLET_REDUCTION_COEFFICIENT"];
        if (this.health <= 0){
            SOUND_MANAGER.play("explode", this.x, this.y);
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
        let newAngle = fixDegrees(360 - this.angle);
        this.angle = newAngle;
        this.facingRight = facingRight;
        this.speed *= (1 - FILE_DATA["constants"]["SLOW_DOWN_AMOUNT"]);
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
            this.y -= FILE_DATA["constants"]["FALL_SPEED"] * timeProportion;
        }
        this.x += this.getXVelocity() * timeProportion;
        SOUND_MANAGER.play("engine", this.x, this.y);
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Determine the x velocity of the plane at the moment
        Method Return: float
    */
    getXVelocity(){
        let effectiveAngle = this.getEffectiveAngle();
        let cosAngle = Math.cos(toRadians(effectiveAngle));
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
        this.throttle = Math.min(Math.max(0, this.throttle + amt), FILE_DATA["constants"]["MAX_THROTTLE"]);
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
}
// When this is opened in NodeJS, export the class
if (typeof window === "undefined"){
    module.exports = Plane;
}