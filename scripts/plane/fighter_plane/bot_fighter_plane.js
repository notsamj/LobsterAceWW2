// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    FighterPlane = require("../scripts/fighter_plane.js");
    onSameTeam = require("../scripts/helper_functions.js").onSameTeam;
    Bullet = require("../scripts/bullet.js");
    var helperFuncs = require("../scripts/helper_functions.js");
    angleBetweenCCWDEG = helperFuncs.angleBetweenCCWDEG;
    fixDegrees = helperFuncs.fixDegrees;
    calculateAngleDiffDEGCW = helperFuncs.calculateAngleDiffDEGCW;
    calculateAngleDiffDEGCCW = helperFuncs.calculateAngleDiffDEGCCW;
    calculateAngleDiffDEG = helperFuncs.calculateAngleDiffDEG;
    toDegrees = helperFuncs.toDegrees;
    InfiniteLoopFinder = require("../scripts/infinite_loop_finder.js");
}
/*
    Class Name: BotFighterPlane
    Description: A subclass of the FighterPlane that determines actions without human input
*/
// TODO: Some stuff in this class might be broken but saved by biased fighter plane (because BotFighterPlane is abstract and only the overridden functions are used in practice [at the moment])
class BotFighterPlane extends FighterPlane {
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
        super(planeClass, scene, angle, facingRight);
        this.currentEnemyID = null;
        this.turningDirection = null;
        this.ticksOnCourse = 0;
        this.tickCD = 0;
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
        super.tick(timeDiffMS);
        // Check if the selected enemy should be changed
        this.updateEnemy();
        // If there is an enemy then act accordingly
        if (this.hasCurrentEnemy()){
            let enemy = this.scene.getEntity(this.currentEnemyID);
            this.handleEnemy(enemy);
        }else{ // No enemy -> make sure not to crash into the ground
            if (this.closeToGround() && angleBetweenCCWDEG(this.getNoseAngle(), 180, 359)){
                this.turnInDirection(90);
                return;
            }
        }
    }

    /*
        Method Name: handleEnemy
        Method Parameters:
            enemy:
                An object of an enemy fighter plane
        Method Description: Decide what to do when given an enemy to attack. Can move and can shoot.
        Method Return: void
    */
    handleEnemy(enemy){
        // Separate into two things
        let myX = this.getGunX();
        let myY = this.getGunY();
        let enemyX = enemy.getX();
        let enemyY = enemy.getY();
        let enemyXDisplacement = enemyX - myX;
        let enemyYDisplacement = enemyY - myY;
        let distanceToEnemy = this.distance(enemy);

        // To prevent issues in calculating angles, if the enemy is ontop of you just shoot and do nothing else
        if (distanceToEnemy < 1){
            this.tryToShootAtEnemy(0, 1, 1);
            return;
        }
        // Otherwise enemy is not too much "on top" of the bot
        let shootingAngle = this.getNoseAngle();
        let angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
        let angleDifference = calculateAngleDiffDEG(shootingAngle, angleDEG);

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleDEG, distanceToEnemy, enemy);

        // Shoot if the enemy is in front
        let hasFiredShot = this.tryToShootAtEnemy(angleDifference, enemy.getHitbox().getRadius(), distanceToEnemy);
        if (hasFiredShot){ return; }

        // Look for other enemies that aren't the primary focus and if they are infront of the plane then shoot
        for (let secondaryEnemy of this.getEnemyList()){
            if (hasFiredShot){ break; }
            enemyX = secondaryEnemy.getX();
            enemyY = secondaryEnemy.getY();
            enemyXDisplacement = enemyX - myX;
            enemyYDisplacement = enemyY - myY;
            angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
            angleDifference = calculateAngleDiffDEG(shootingAngle, angleDEG);
            distanceToEnemy = this.distance(secondaryEnemy);
            hasFiredShot = this.tryToShootAtEnemy(angleDifference, secondaryEnemy.getHitbox().getRadius(), distanceToEnemy);
        }
    }

    /*
        Method Name: handleMovement
        Method Parameters:
            anlgeDEG:
                An angle from the current location to that of the enemy
            distance:
                The current distance from the current location to the enemy
            enemy:
                An enemy fighter plane
        Method Description: Decide how to move given the presence of an enemy.
        Method Return: void
    */
    handleMovement(angleDEG, distance, enemy){
        // If facing downwards and close to the ground then turn upwards
        if (this.closeToGround() && angleBetweenCCWDEG(this.getNoseAngle(), 180, 359)){
            this.turnInDirection(90);
            return;
        }

        // Point to enemy when very far away
        if (distance > this.speed * FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] * FILE_DATA["constants"]["TURN_TO_ENEMY_CONSTANT"]){
            this.turnInDirection(angleDEG);
            this.turningDirection = null; // Evasive maneuevers cut off if far away
            return;
        }

        // Else at a medium distance to enemy
        this.handleClose(angleDEG, distance, enemy);
    }

    handleClose(angleDEG, distance, enemy){
        let myAngle = this.getNoseAngle();

        // If enemy is behind, so evasive manuevers
        if (angleBetweenCWDEG(angleDEG, rotateCWDEG(myAngle, 135), rotateCCWDEG(myAngle, 135)) && distance < this.getMaxSpeed() * EVASIVE_SPEED_DIFF){
            this.evasiveManeuver(enemy, distance);
            return;
        }

        // If on a movement cooldown
        if (this.tickCD-- > 0){
            return;
        }

        // Not doing evausive maneuevers
        // If we have been chasing the enemy non-stop for too long at a close distance then move away (circles)
        if (this.ticksOnCourse >= FILE_DATA["ai"]["max_ticks_on_course"]){
            this.tickCD = FILE_DATA["ai"]["tick_cd"];
            this.ticksOnCourse = 0;
        }

        this.turningDirection = null;
        this.ticksOnCourse += 1;
        this.turnInDirection(angleDEG);
    }

    /*
        Method Name: comeUpWithEvasiveTurningDirection
        Method Parameters: None
        Method Description: Pick a direction to turn when you must conduct evasive maneuvers
        Method Return: True, turn cw, false then turn ccw
    */
    comeUpWithEvasiveTurningDirection(){
        return (randomNumberInclusive(1, 2) == 1) ? 1 : -1;
    }

    /*
        Method Name: evasiveManeuver
        Method Parameters: None
        Method Description: Turn to a direction as part of an evasive maneuver
        Method Return: void
    */
    evasiveManeuver(){
        if (this.turningDirection == null){
            this.turningDirection = this.comeUpWithEvasiveTurningDirection();
        }
        this.adjustAngle(this.turningDirection);
    }

    /*
        Method Name: closeToGround
        Method Parameters: None
        Method Description: Determine if the plane is close to the ground
        Method Return: True if close to the ground, false if not close
    */
    closeToGround(){
        return this.y < FILE_DATA["constants"]["CLOSE_TO_GROUND_CONSTANT"] * this.speed;
    }

    /*
        Method Name: turnInDirection
        Method Parameters:
            angleDEG:
                The angle to turn to (degrees)
        Method Description: Turn the plane in a given direction
        Method Return: void
    */
    turnInDirection(angleDEG){
        // Determine if we need to switch from left to right
        let myAngle = this.getNoseAngle();
        // If facing right and the angle to turn to is very far but close if the plane turned left
        if (this.facingRight && angleBetweenCCWDEG(angleDEG, 135, 225) && angleBetweenCCWDEG(myAngle, 315, 45)){
            this.face(false);
            return;
        }
        // If facing left and the angle to turn to is very far but close if the plane turned right
        else if (!this.facingRight && angleBetweenCCWDEG(angleDEG, 295, 45) && angleBetweenCCWDEG(angleDEG, 135, 225)){
            this.face(true);
            return;
        }

        let newAngleCW = fixDegrees(this.getNoseAngle() + 1);
        let newAngleCCW = fixDegrees(this.getNoseAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);

        // If the angle of the plane currently is very close to the desired angle, not worth moving
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < FILE_DATA["constants"]["MIN_ANGLE_TO_ADJUST"] && calculateAngleDiffDEG(newAngleCCW, angleDEG) < FILE_DATA["constants"]["MIN_ANGLE_TO_ADJUST"]){
            return;
        }
        // The clockwise distance is less than the counter clockwise difference and facing right then turn clockwise 
        if (dCW < dCCW && this.facingRight){
            this.adjustAngle(-1);
        }
        // The clockwise distance is less than the counter clockwise difference and facing left then turn counter clockwise 
        else if (dCW < dCCW && !this.facingRight){
            this.adjustAngle(1);
        }
        // The counter clockwise distance is less than the clockwise difference and facing right then turn counter clockwise 
        else if (dCCW < dCW && this.facingRight){
            this.adjustAngle(1);
        }
        // The counter clockwise distance is less than the clockwise difference and facing left then turn clockwise 
        else if (dCCW < dCW && !this.facingRight){
            this.adjustAngle(-1);
        }
        // Otherwise just turn clockwise (Shouldn't actually be possible?)
        else{
            this.adjustAngle(1);
        }

    }

    /*
        Method Name: tryToShootAtEnemy
        Method Parameters:
            angleDifference:
                Difference between current angle and the angle to the enemy
            enemyRadius:
                The radius of the enemy's hitbox
            distanceToEnemy:
                The distance to the enemy
        Method Description: Turn the plane in a given direction. True if shot, false if not.
        Method Return: boolean
    */
    tryToShootAtEnemy(angleDifference, enemyRadius, distanceToEnemy){
        let angleAllowanceAtRangeDEG = toDegrees(Math.abs(Math.atan(enemyRadius / distanceToEnemy)));
        // If ready to shoot and the angle & distance are acceptable then shoot
        if (this.shootLock.isReady() && angleDifference < angleAllowanceAtRangeDEG && distanceToEnemy < this.getMaxShootingDistance()){
            this.shootLock.lock();
            this.shoot();
            return true;
        }
        return false;
    }

    /*
        Method Name: getEnemyList
        Method Parameters: None
        Method Description: Find all the enemies and return them
        Method Return: List
    */
    getEnemyList(){
        let entities = this.scene.getPlanes();
        let enemies = [];
        for (let entity of entities){
            if (entity instanceof Plane && !this.onSameTeam(entity)){
                enemies.push(entity);
            }
        }
        return enemies;
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemyID != null && this.scene.hasEntity(this.currentEnemyID) && this.distance(this.scene.getEntity(this.currentEnemyID)) <= FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;
        // Loop through all enemies and determine a score for being good to attack
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            let score = distance * (BotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID()) + 1)
            // If this new enemy is better
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "id": enemy.getID(),
                    "score": score
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemyID = bestRecord["id"];
    }

    /*
        Method Name: hasCurrentEnemy
        Method Parameters: None
        Method Description: Determine if there is currently a current enemy
        Method Return: True if has an enemy (and they exist), otherwise false
    */
    hasCurrentEnemy(){
        return this.currentEnemyID != null && this.scene.hasEntity(this.currentEnemyID);
    }

    /*
        Method Name: getCurrentEnemy
        Method Parameters: None
        Method Description: Get the id of the current enemy
        Method Return: A string of the id of the current enemy
    */
    getCurrentEnemy(){
        return this.currentEnemyID;
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
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return FILE_DATA["constants"]["SHOOT_DISTANCE_CONSTANT"] * FILE_DATA["bullet_data"]["speed"];
    }

    /*
        Method Name: isFocused
        Method Parameters:
            scene:
                A Scene object related to the fighter plane
            enemyID:
                A string ID of the enemy plane
            myID:
                A string ID of the plane making the inquiry
        Method Description: Determines if another plane is focused on an enemy that "I" am thinking about focusing on
        Method Return: boolean, True if another plane has the enemyID as a current enemy, false otherwise
    */
    static isFocused(scene, enemyID, myID){
        return focusedCount(scene, enemyID, myID)
    }

    /*
        Method Name: focusedCount
        Method Parameters:
            scene:
                A Scene object related to the fighter plane
            enemyID:
                A string ID of the enemy plane
            myID:
                A string ID of the plane making the inquiry
        Method Description: Determines how many other planes are focused on an enemy that "I" am thinking about focusing on
        Method Return: int
    */
    static focusedCount(scene, enemyID, myID){
        let count = 0;
        for (let entity of scene.getEntities()){
            if (entity instanceof BotFighterPlane && entity.getID() != myID && entity.getCurrentEnemy() == enemyID){
                count += 1;
            }
        }
        return count;
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BotFighterPlane;
}