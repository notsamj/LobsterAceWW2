// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    BotFighterPlane = require("../scripts/bot_fighter_plane.js");
    CooldownLock = require("../scripts/cooldown_lock.js");
    FILE_DATA = require("../data/data_json.js");
    var helperFuncs = require("../scripts/helper_functions.js");
    rotateCWDEG = helperFuncs.rotateCWDEG;
    rotateCCWDEG = helperFuncs.rotateCCWDEG;
    lessThanEQDir = helperFuncs.lessThanEQDir;
    randomNumberInclusive = helperFuncs.randomNumberInclusive;
    displacementToDegrees = helperFuncs.displacementToDegrees;
    nextIntInDir = helperFuncs.nextIntInDir;
}
/*
    Class Name: BiasedBotFighterPlane
    Description: A subclass of the BotFighterPlane with biases for its actions
*/
class BiasedBotFighterPlane extends BotFighterPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            biases:
                An object containing keys and bias values
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, biases, angle=0, facingRight=true){
        super(planeClass, scene, angle, facingRight);
        this.biases = biases;
        this.throttle += this.biases["throttle"];
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.rotationCD = new CooldownLock(this.biases["rotation_time"]);
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
        // Establish basic facts
        let myX = this.getGunX();
        let myY = this.getGunY();
        let enemyX = enemy.getX();
        let enemyY = enemy.getY();
        let enemyXDisplacement = enemyX - myX;
        let enemyYDisplacement = enemyY - myY;
        let distanceToEnemy = this.distance(enemy);

        // Bias
        distanceToEnemy += this.biases["distance_to_enemy"];
        // To prevent issues in calculating angles, if the enemy is ontop of you just shoot and do nothing else
        if (distanceToEnemy < 1){
            this.tryToShootAtEnemy(0, 1, 1);
            return;
        }

        // Otherwise enemy is not too much "on top" of the bot
        let shootingAngle = this.getNoseAngle();
        let angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
        
        // Bias
        angleDEG = fixDegrees(angleDEG + this.biases["angle_to_enemy"]);
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
            angleDEG = fixDegrees(angleDEG + this.biases["angle_to_enemy"]);
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
            // Bias
            this.turnInDirection(fixDegrees(90 + this.biases["angle_from_ground"]));
            return;
        }

        // Point to enemy when very far away
        if (distance > this.speed * FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] * FILE_DATA["constants"]["TURN_TO_ENEMY_CONSTANT"] + this.biases["enemy_far_away_distance"]){
            this.turnInDirection(angleDEG);
            this.turningDirection = null; // Evasive maneuevers cut off if far away
            return;
        }

        // Else at a medium distance to enemy
        this.handleClose(angleDEG, distance, enemy);
    }


    /*
        Method Name: handleClose
        Method Parameters:
            anlgeDEG:
                An angle from the current location to that of the enemy
            distance:
                The current distance from the current location to the enemy
            enemy:
                An enemy fighter plane
        Method Description: Decide how to handle an enemy is that very close by
        Method Return: void
    */
    handleClose(angleDEG, distance, enemy){
        let myAngle = this.getNoseAngle();

        // If enemy is behind, then do evasive manuevers
        if (angleBetweenCWDEG(angleDEG, rotateCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"])), rotateCCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"]))) && distance < this.getMaxSpeed() * FILE_DATA["constants"]["EVASIVE_SPEED_DIFF"] + this.biases["enemy_close_distance"]){
            this.evasiveManeuver();
            return;
        }
        // If on a movement cooldown then return because nothing to do
        if (this.tickCD-- > 0){
            return;
        }
        
        // Not doing evausive maneuevers

        // If we have been chasing the enemy non-stop for too long at a close distance then move away (circles)
        if (this.ticksOnCourse >= FILE_DATA["ai"]["fighter_plane"]["max_ticks_on_course"] + this.biases["max_ticks_on_course"]){
            this.tickCD = FILE_DATA["ai"]["fighter_plane"]["tick_cd"] + this.biases["ticks_cooldown"];
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
        return (randomNumberInclusive(1, 100) + this.biases["turn_direction"] <= 50) ? 1 : -1;
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
        if (!this.rotationCD.isReady()){ return; }
        this.rotationCD.lock();
        let newAngle = this.angle;

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
        Method Name: closeToGround
        Method Parameters: None
        Method Description: Determine if the plane is close to the ground
        Method Return: True if close to the ground, false if not close
    */
    closeToGround(){
        return this.y < FILE_DATA["constants"]["CLOSE_TO_GROUND_CONSTANT"] * this.speed + this.biases["close_to_ground"];
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
        if (this.facingRight && angleBetweenCCWDEG(angleDEG, 135 + this.biases["flip_direction_lb"], 225 + this.biases["flip_direction_ub"]) && angleBetweenCCWDEG(myAngle, 315 + this.biases["flip_direction_lb"], 45 + this.biases["flip_direction_ub"])){
            this.face(false);
            return;
        }
        // If facing left and the angle to turn to is very far but close if the plane turned right
        else if (!this.facingRight && angleBetweenCCWDEG(angleDEG, 295 + this.biases["flip_direction_lb"], 45 + this.biases["flip_direction_ub"]) && angleBetweenCCWDEG(angleDEG, 135 + this.biases["flip_direction_lb"], 225 + this.biases["flip_direction_ub"])){
            this.face(true);
            return;
        }
        
        let newAngleCW = fixDegrees(this.getNoseAngle() + 1);
        let newAngleCCW = fixDegrees(this.getNoseAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);
        // If the angle of the plane currently is very close to the desired angle, not worth moving
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < FILE_DATA["constants"]["MIN_ANGLE_TO_ADJUST"] + this.biases["min_angle_to_adjust"] && calculateAngleDiffDEG(newAngleCCW, angleDEG) < FILE_DATA["constants"]["MIN_ANGLE_TO_ADJUST"] + this.biases["min_angle_to_adjust"]){
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
        if (this.shootLock.isReady() && angleDifference < angleAllowanceAtRangeDEG + this.biases["angle_allowance_at_range"] && distanceToEnemy < this.getMaxShootingDistance()){
            this.shootLock.lock();
            this.shoot();
            return true;
        }
        return false;
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemyID != null && this.scene.hasEntity(this.currentEnemyID) && this.distance(this.scene.getEntity(this.currentEnemyID)) <= (FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] + this.biases["enemy_disregard_distance_time_constant"]) * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;
        // Loop through all enemies and determine a score for being good to attack
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            let score = calculateEnemyScore(distance, BotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID()) * this.biases["enemy_taken_distance_multiplier"]);
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "id": enemy.getID(),
                    "score": score
                }
            }
        }
        // If none found then do nothing
        if (bestRecord == null){ return; }
        this.currentEnemyID = bestRecord["id"];
    }

    /*
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return FILE_DATA["constants"]["SHOOT_DISTANCE_CONSTANT"] * FILE_DATA["bullet_data"]["speed"] + this.biases["max_shooting_distance"];
    }

    /*
        Method Name: createBiasedPlane
        Method Parameters: 
            planeClass:
                A string representing the type of the plane
            scene:
                A scene objet related to the plane
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    static createBiasedPlane(planeClass, scene){
        let biases = {};
        for (let [key, bounds] of Object.entries(FILE_DATA["ai"]["fighter_plane"]["bias_ranges"])){
            let upperBound = bounds["upper_bound"];
            let lowerBound = bounds["lower_bound"];
            let usesFloatValue = Math.floor(upperBound) != upperBound || Math.floor(lowerBound) != lowerBound;
            biases[key] = usesFloatValue ? randomFloatBetween(lowerBound, upperBound) : randomNumberInclusive(lowerBound, upperBound);    
        }
        return new BiasedBotFighterPlane(planeClass, scene, biases);
    }
}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotFighterPlane;
}