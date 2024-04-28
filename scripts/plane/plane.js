// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("../../scripts/other_entities/entity.js");
    PROGRAM_DATA = require("../../data/data_json.js");
    CircleHitbox = require("../../scripts/general/hitboxes.js").CircleHitbox;
    helperFunctions = require("../../scripts/general/helper_functions.js");
    toRadians = helperFunctions.toRadians;
    onSameTeam = helperFunctions.onSameTeam;
    getTickMultiplier = helperFunctions.getTickMultiplier;
    fixRadians = helperFunctions.fixRadians;
    angleBetweenCCWRAD = helperFunctions.angleBetweenCCWRAD;
    safeDivide = helperFunctions.safeDivide;
    calculateAngleDiffRAD = helperFunctions.calculateAngleDiffRAD;
    isClose = helperFunctions.isClose;
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
            gamemode:
                A gamemode object related to the plane
            autonomous:
                Whether this instance of the plane can control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, autonomous=false){
        super(gamemode);
        this.planeClass = planeClass;
        this.facingRight = true;
        this.angle = 0;
        this.throttle = PROGRAM_DATA["settings"]["max_throttle"];
        this.startingThrottle = this.throttle;
        this.maxSpeed = PROGRAM_DATA["plane_data"][planeClass]["max_speed"];
        this.speed = this.maxSpeed;
        this.hitBox = new CircleHitbox(PROGRAM_DATA["plane_data"][planeClass]["radius"]);
        this.health = PROGRAM_DATA["plane_data"][planeClass]["health"];
        this.startingHealth = this.health;
        this.throttleConstant = Math.sqrt(this.maxSpeed) / PROGRAM_DATA["settings"]["max_throttle"];
        this.interpolatedX = 0;
        this.interpolatedY = 0;
        this.x = 0;
        this.y = 0;
        this.autonomous = autonomous;
        this.decisions = {
            "face": 0, // 1 -> right, -1 -> left, 0 -> no change
            "angle": 0, // 1 -> ccw by 1 deg, -1 -> cw by 1 deg, 0 -> no change
            "throttle": 0, // 1 -> up by 1 deg, -1 -> down by 1 deg, 0 -> no change
            "shoot": false, // true -> shoot, false -> don't shoot
            "last_movement_mod_tick": -1, // Used to determine if its worth updating the planes position when provided with a JSON representation 
        }
    }

    /*
        Method Name: correctFacingDirection
        Method Parameters: None
        Method Description: This function chooses to change the facing direction of the plane based on its angle
        Method Return: void
    */
    correctFacingDirection(){
        // If not fighting an enemy then roll over the plane if needed
        let noseAngle = this.getNoseAngle();
        let facingRight = this.isFacingRight();
        // If facing right and plane is rolled over then switch to right
        if (facingRight && angleBetweenCWRAD(noseAngle, toRadians(250), toRadians(110))){
            this.decisions["face"] = -1;
        }else if (!facingRight && angleBetweenCWRAD(noseAngle, toRadians(70), toRadians(290))){
            this.decisions["face"] = 1;
        }
    }

    /*
        Method Name: getStartingThrottle
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getStartingThrottle(){
        return this.startingThrottle;
    }

    /*
        Method Name: setAutonomous
        Method Parameters:
            value:
                Boolean, whether or not plane is autonomous
        Method Description: Setter
        Method Return: void
    */
    setAutonomous(value){
        this.autonomous = value;
    }

    /*
        Method Name: isAutonomous
        Method Parameters: None
        Method Description: Checks if the plane is autonomous
        Method Return: Boolean
    */
    isAutonomous(){
        return this.autonomous;
    }

    /*
        Method Name: getTeamCombatManager
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: TeamCombatManager
    */
    getTeamCombatManager(){
        return this.gamemode.getTeamCombatManager();
    }

    /*
        Method Name: getScene
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: PlaneGameScene
    */
    getScene(){
        return this.gamemode.getScene();
    }

    /*
        Method Name: getGamemode
        Method Parameters: None
        Method Description: Getter
        Method Return: Gamemode
    */
    getGamemode(){
        return this.gamemode;
    }

    /*
        Method Name: loadMovementIfNew
        Method Parameters:
            rep:
                A json representation of the plane
            rollForwardAmount:
                The number of ticks behind that this information is
        Method Description: Loads the movement information about the plane if the source has a newer set of values
        Method Return: void
    */
    loadMovementIfNew(rep, rollForwardAmount=0){
        let takePosition = rep["decisions"]["last_movement_mod_tick"] > this.decisions["last_movement_mod_tick"];
        if (!takePosition){ return; }
        this.x = rep["basic"]["x"];
        this.y = rep["basic"]["y"];
        this.facingRight = rep["basic"]["facing_right"];
        this.angle = rep["basic"]["angle"];
        this.throttle = rep["basic"]["throttle"];
        this.speed = rep["basic"]["speed"];
        this.decisions = rep["decisions"];
        let shouldRollForward = rollForwardAmount > 0;
        // Approximate plane positions in current tick based on position in server tick
        if (shouldRollForward){
            this.rollForward(rollForwardAmount);
        }
    }

    /*
        Method Name: die
        Method Parameters: None
        Method Description: Handle the death of a plane
        Method Return: void
    */
    die(){
        this.gamemode.getSoundManager().play("explode", this.getX(), this.getY());
        this.gamemode.getEventHandler().emit({
            "name": "explode",
            "size": this.getWidth(),
            "x": this.getX(),
            "y": this.getY()
        });
        super.die();
    }

    /*
        Method Name: getCurrentTicks
        Method Parameters: None
        Method Description: Get the current tick count of the gamemode mode
        Method Return: integer
    */
    getCurrentTicks(){
        return this.gamemode.getNumTicks();
    }

    /*
        Method Name: setAlive
        Method Parameters:  
            alive:
                Boolean, alive or not
        Method Description: Setter
        Method Return: void
    */
    setAlive(alive){
        this.dead = !alive;
    }

    /*
        Method Name: getXAtStartOfTick
        Method Parameters: None
        Method Description: Calculates the x at the start of the tick
        Method Return: Number
    */
    getXAtStartOfTick(){
        return this.getNewPositionValues(-1 * PROGRAM_DATA["settings"]["ms_between_ticks"])["x"];
    }

    /*
        Method Name: getYAtStartOfTick
        Method Parameters: None
        Method Description: Calculates the y at the start of the tick
        Method Return: Number
    */
    getYAtStartOfTick(){
        return this.getNewPositionValues(-1 * PROGRAM_DATA["settings"]["ms_between_ticks"])["y"];
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
        Method Name: getStartingThrottle
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getStartingThrottle(){
        return this.startingThrottle;
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
        Method Name: getSmokeStage
        Method Parameters: None
        Method Description: Provides information about what state of decay the plane is in
        Method Return: an integer number in range [0, Number of smoke images]
    */
    getSmokeStage(){
        let hpMissingProportion = (this.startingHealth - this.health) / this.startingHealth;
        let phaseTotal = PROGRAM_DATA["plane_smoke"]["number_of_stages"] + 1;
        let phaseIntervalSize = 1 / phaseTotal;
        let smokeStage = Math.floor(hpMissingProportion / phaseIntervalSize);
        return smokeStage;
    }

    /*
        Method Name: getMaxThrottle
        Method Parameters: None
        Method Description: Determine the maximum throttle of a plane based on its health
        Method Return: Integer in range [0,100]
    */
    getMaxThrottle(){
        return Math.floor(this.startingThrottle * (1 - PROGRAM_DATA["settings"]["health_effect_on_throttle"] * (this.startingHealth - this.health) / this.startingHealth));
    }

    /*
        Method Name: isSmoking
        Method Parameters: None
        Method Description: Determines if the plane is damaged enough to start smoking
        Method Return: Boolean, true -> smoking, false -> not smoking
    */
    isSmoking(){
        return this.getSmokeStage() > 0;
    }

    /*
        Method Name: displaySmoke
        Method Parameters: None
        Method Description: Displays smoke if this plane is sufficiently damaged
        Method Return: void
    */
    displaySmoke(){
        if (!this.isSmoking()){ return; }
        let smokeStage = this.getSmokeStage();
        this.gamemode.getVisualEffectManager().addPlaneSmoke(this.getID(), smokeStage, this.getPlaneClass(), (this instanceof BomberPlane) ? 2 : 1, this.getInterpolatedX(), this.getInterpolatedY(), this.getInterpolatedAngle(), this.isFacingRight());
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
        this.gamemode.getSoundManager().play("damage", this.x, this.y);
        this.health -= amount * PROGRAM_DATA["settings"]["bullet_reduction_coefficient"];
        this.throttle = Math.min(this.throttle, this.getMaxThrottle());
        this.decisions["last_movement_mod_tick"] = this.getCurrentTicks();
        if (this.health <= 0){
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
        Method Name: hasNoControl
        Method Parameters: None
        Method Description: Determines if the plane can control itself
        Method Return: Boolean
    */
    hasNoControl(){
        return this.throttle == 0;
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
        if (this.hasNoControl()){ return; }
        // Determine angle
        if (this.facingRight){
            newAngle += amount;
        }else{
            newAngle -= amount;
        }

        // Ensure new angle is within proper range
        newAngle = fixRadians(newAngle);
        this.angle = newAngle;
    }

    /*
        Method Name: face
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
        if (this.hasNoControl()){ return; }
        let newAngle = fixRadians(this.angle + toRadians(180));
        this.angle = newAngle;
        this.facingRight = facingRight;
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
        return IMAGES[this.getImageIdentifier()];
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
        // If using NodeJS -> Just use 2x hitbox radius
        if (typeof window === "undefined"){ return this.hitBox.getRadius()*2; }
        return this.getCurrentImage().width / PROGRAM_DATA["settings"]["plane_image_size_constant"];
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Determine the height of the current plane image
        Method Return: int
    */
    getHeight(){
        // If using NodeJS -> Just use 2x hitbox radius
        if (typeof window === "undefined"){ return this.hitBox.getRadius()*2; }
        return this.getCurrentImage().height / PROGRAM_DATA["settings"]["plane_image_size_constant"];
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        // If hit the ground
        if (this.y - this.hitBox.getRadiusEquivalentY() <= 0){
            this.die();
            return;
        }
         // Then do things like move
        this.executeMainDecisions();
        // Move the plane
        let newPositionValues = this.getNewPositionValues(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.x = newPositionValues["x"];
        this.y = newPositionValues["y"];
        this.speed = newPositionValues["speed"];
        this.gamemode.getSoundManager().play("engine", this.x, this.y);
        this.executeAttackingDecisions();
        this.makeDecisions();
    }

    /*
        Method Name: getNewPositionValues
        Method Parameters:
            timeDiffMS:
                The time difference for the new position values
            displayOnly:
                Whether the new value are for display only, should use decisions to affect angle
        Method Description: Determines new x, y, speed values for a tick
        Method Return: JSON Object
    */
    getNewPositionValues(timeDiffMS, displayOnly=false){
        let timeProportion = (timeDiffMS / 1000);

        // Throttle - Drag
        let throttle = this.throttle;
        if (displayOnly){
            throttle += this.decisions["throttle"];
        }
        let throttleAcc = throttle * this.throttleConstant;
    
        // Drag
        let dragAcc = Math.sqrt(Math.abs(this.speed));

        let acceleration = throttleAcc - dragAcc;

        // Speed
        let speed = this.speed + acceleration * timeProportion;
        speed = Math.max(speed, 0);

        // Finally the position

        // Handle zero throttle
        let y;
        if (throttle > 0){
            y = this.y + this.getYVelocity(speed, displayOnly) * timeProportion;
        }else{
            y = this.y - PROGRAM_DATA["settings"]["fall_speed"] * timeProportion;
        }
        let x = this.x + this.getXVelocity(speed, displayOnly) * timeProportion;
        return {"x": x, "y": y, "speed": speed}
    }

    /*
        Method Name: rollForward
        Method Parameters:
            amount:
                The number of ticks foward to move the plane
        Method Description: Simulates multiple ticks moving the plane forward
        Method Return: void
    */
    rollForward(amount){
        for (let i = 0; i < amount; i++){
            let values = this.getNewPositionValues(PROGRAM_DATA["settings"]["ms_between_ticks"]);
            this.x = values["x"];
            this.y = values["y"];
            this.speed = values["speed"];
        }
    }

    // Abstract
    makeDecisions(){}

    // Abstract
    executeDecisions(){}

    /*
        Method Name: getXVelocity
        Method Parameters:
            speed:
                The speed that we are travelling
            interpolated:
                Whether or not the x velocity is dependent on the angle decision    
        Method Description: Determine the x velocity of the plane at the moment
        Method Return: float
    */
    getXVelocity(speed=this.speed, interpolated=false){
        let angle = interpolated ? this.interpolatedAngle : this.angle;
        let effectiveAngle = this.getEffectiveAngle(angle);
        let cosAngle = Math.cos(effectiveAngle);
        return speed * cosAngle * (!this.facingRight ? -1 : 1);
    }

    /*
        Method Name: getYVelocity
            speed:
                The speed that we are travelling
            interpolated:
                Whether or not the y velocity is dependent on the angle decision
        Method Description: Determine the y velocity of the plane at the moment
        Method Return: float
    */
    getYVelocity(speed=this.speed, interpolated=false){
        let angle = interpolated ? this.interpolatedAngle : this.angle;
        let effectiveAngle = this.getEffectiveAngle(angle);
        let sinAngle = Math.sin(effectiveAngle)
        return speed * sinAngle;
    }

    /*
        Method Name: getEffectiveAngle
        Method Parameters:
            angle:
                The angle to modify to find the effective angle
        Method Description: 
        Determine the effective angle of the plane at the moment, 
        if facing left must be changed to match what it would be if facing right
        Method Return: float in range [0,2*PI)
    */
    getEffectiveAngle(angle=this.angle){
        let effectiveAngle = angle;
        if (!this.isFacingRight()){
            effectiveAngle = fixRadians(toRadians(360) - effectiveAngle);
        }
        return effectiveAngle;
    }

    /*
        Method Name: getNoseAngle
        Method Parameters: None
        Method Description: 
        Determine the angle at which bullets shoot out of the plane
        Method Return: float in range [0,2*PI)
    */
    getNoseAngle(){
        return fixRadians(this.angle + (this.facingRight ? 0 : toRadians(180)));
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
        this.throttle = Math.min(Math.max(0, this.throttle + amt), this.getMaxThrottle());
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
        Method Name: isHuman
        Method Parameters: None
        Method Description: Determines whether the entity is controlled by a human.
        Method Return: boolean, true -> is controlled by a human, false -> is not controlled by a human
    */
    isHuman(){
        return false;
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
        Method Name: getInterpolatedAngle
        Method Parameters: None
        Method Description: Getter
        Method Return: float in range [0, 2*PI)
    */
    getInterpolatedAngle(){
        return this.interpolatedAngle;
    }

    /*
        Method Name: calculateInterpolatedCoordinates
        Method Parameters:
            currentTime:
                The time at which the plane's position is being interpolated
        Method Description: Sets the interpolated variables for the plane's position
        Method Return: void
    */
    calculateInterpolatedCoordinates(currentTime){
        // TODO: Clean this up
        let currentFrameIndex = FRAME_COUNTER.getFrameIndex();
        if (GAMEMODE_MANAGER.getActiveGamemode().isPaused() || !GAMEMODE_MANAGER.getActiveGamemode().isRunning() || this.isDead() || this.lastInterpolatedFrame == currentFrameIndex){
            return;
        }
        let extraTime = currentTime - GAMEMODE_MANAGER.getActiveGamemode().getLastTickTime();
        let newPositionValues = this.getNewPositionValues(extraTime);
        if (this.throttle > 0){
            this.interpolatedAngle = fixRadians(this.getAngle() + (this.isFacingRight() ? 1 : -1) * extraTime / PROGRAM_DATA["settings"]["ms_between_ticks"] * this.decisions["angle"]); 
        }else{
            this.interpolatedAngle = fixRadians(this.getAngle());
        }
        this.lastInterpolatedFrame = currentFrameIndex;
        this.interpolatedX = newPositionValues["x"];
        this.interpolatedY = newPositionValues["y"];
    }


    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
            displayTime:
                The time used to interpolate the positions of the planes
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;

        // Set the interpolated coordinates
        this.calculateInterpolatedCoordinates(displayTime);

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        let planeConstant = PROGRAM_DATA["settings"]["plane_image_size_constant"];
        // Determine the location it will be displayed at
        let displayX = this.gamemode.getScene().getDisplayX(this.interpolatedX, this.getWidth()*gameZoom, lX);
        let displayY = this.gamemode.getScene().getDisplayY(this.interpolatedY, this.getHeight()*gameZoom, bY);

        // If dead then draw the explosion instead
        if (this.isDead()){
            return; 
        }

        // Find x and y of image given its rotation
        let rotateX = displayX + this.getWidth() / 2 * gameZoom;
        let rotateY = displayY + this.getHeight() / 2 * gameZoom;
        let interpolatedAngle = this.getInterpolatedAngle();
        
        // Prepare the display
        translate(rotateX, rotateY);
        rotate(-1 * interpolatedAngle);

        // If facing left then turn around the display
        if (!this.isFacingRight()){
            scale(-1, 1);
        }


        // Game zoom
        scale(gameZoom * 1 / planeConstant, gameZoom * 1 / planeConstant);

        // Display plane
        displayImage(this.getImage(), 0 - this.getWidth() / 2 * planeConstant, 0 - this.getHeight() / 2 * planeConstant); 

        // Undo game zoom

        scale(1/gameZoom * planeConstant, 1/gameZoom * planeConstant);

        // If facing left then turn around the display (reset)
        if (!this.isFacingRight()){
            scale(-1, 1);
        }

        // Reset the rotation and translation
        rotate(interpolatedAngle);
        translate(-1 * rotateX, -1 * rotateY);

        // Display Smoke
        this.displaySmoke();
    }

    /*
        Method Name: instantShot
        Method Parameters:
            gunX:
                The x location of the gun
            gunY:
                The y location of the gun
            angleRAD:
                The orientation of the gun
            fauxBullet:
                A false bullet provided optionally
        Method Description: Shots the gun at a target in the direction its facing. The shot moves with infinite speed.
        Method Return: void
    */
    instantShot(gunX, gunY, angleRAD, fauxBullet=null){
        // Determine if the plane is facing -x or +x (not proper if plane is perpenticular to the x axis)
        let xDir = (angleBetweenCCWRAD(angleRAD, toRadians(91), toRadians(269))) ? -1 : 1;
        if (isClose(angleRAD, toRadians(90), 0.01) || isClose(angleRAD, toRadians(270), 0.01)){
            xDir = this.isFacingRight() ? 1 : -1;
        }

        // Determine if the plane is facing -y or +y (not proper if plane is perpenticular to the y axis)
        let yDir = (angleBetweenCCWRAD(angleRAD, 0, toRadians(180))) ? 1 : -1;

        let bestPlane = null;
        let bestDistance = null;
        // Find the best plane to shoot at
        for (let plane of this.gamemode.getTeamCombatManager().getLivingPlanes()){
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
            let theta = displacementToRadians(plane.getX() - gunX, plane.getY() - gunY);
            // Let alpha represent the maximum difference of angle allowed at the distance to hit the hitbox
            let alpha = fixRadians(toRadians(Math.asin(safeDivide(planeHitbox.getRadius(), distance, 1, 0))));
            // If the difference is too big then ignore
            if (calculateAngleDiffRAD(angleRAD, theta) > alpha){
                continue;
            }
            // Otherwise this is currently the plane that will be hit
            bestPlane = plane;
            bestDistance = distance;
        }

        // If we failed to find a plane getting shot then return
        if (bestPlane == null){ return; }
        // Hit the plane
        if (fauxBullet == null){
            fauxBullet = new Bullet(null, null, this.gamemode, null, null, null, this.getID(), this.planeClass, PROGRAM_DATA["plane_data"][this.getPlaneClass()]["bullet_damage"]);
        }
        bestPlane.damage(fauxBullet.getDamage());
        if (bestPlane.isDead()){
            // Make a fake bullet just because that's how the handlekill function works
            this.gamemode.getTeamCombatManager().handleKill(fauxBullet, bestPlane);
        }
    }
}
// When this is opened in NodeJS, export the class
if (typeof window === "undefined"){
    module.exports = Plane;
}