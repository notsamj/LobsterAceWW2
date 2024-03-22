// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    FighterPlane = require("./fighter_plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    displacementToDegrees = helperFunctions.displacementToDegrees;
    angleBetweenCCWDEG = helperFunctions.angleBetweenCCWDEG;
    calculateAngleDiffDEG = helperFunctions.calculateAngleDiffDEG;
    calculateAngleDiffDEGCW = helperFunctions.calculateAngleDiffDEGCW;
    calculateAngleDiffDEGCCW = helperFunctions.calculateAngleDiffDEGCCW;
    rotateCWDEG = helperFunctions.rotateCWDEG;
    rotateCCWDEG = helperFunctions.rotateCCWDEG;
    randomNumberInclusive = helperFunctions.randomNumberInclusive;
    randomFloatBetween = helperFunctions.randomFloatBetween;
    toDegrees = helperFunctions.toDegrees;
    fixDegrees = helperFunctions.fixDegrees;
    copyObject = helperFunctions.copyObject;
}
/*
    Class Name: BiasedBotFighterPlane
    Description: A subclass of the FighterPlane that is a bot with biases for its actions
    Note: For future efficiency the focused count thing is inefficient
*/
class BiasedBotFighterPlane extends FighterPlane {
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
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, biases, angle=0, facingRight=true, autonomous=true){
        super(planeClass, scene, angle, facingRight);
        this.currentEnemy = null;
        this.turningDirection = null;
        this.ticksOnCourse = 0;
        this.tickCD = 0;
        this.biases = biases;
        this.updateEnemyLock = new TickLock(PROGRAM_DATA["ai"]["fighter_plane"]["update_enemy_cooldown"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.throttle = Math.floor(this.throttle + this.biases["throttle"]); // Throttle must be an integer
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.startingHealth = this.health;
        this.rotationCD = new TickLock(this.biases["rotation_time"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.autonomous = autonomous;
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
        this.rotationCD.tick();
        this.updateEnemyLock.tick();
        super.tick(timeDiffMS);
    }

    // TODO: Comments
    makeDecisions(){
        // Sometimes the bot is controlled externally so doesn't need to make its own decisions
        if (!this.autonomous){
            return;
        }
        let startingDecisions = copyObject(this.decisions);
        this.resetDecisions();
        
        if (this.updateEnemyLock.isReady()){
            this.updateEnemyLock.lock();
            // Check if the selected enemy should be changed
            this.updateEnemy();
        }
        // If there is an enemy then act accordingly
        if (this.hasCurrentEnemy()){
            this.handleEnemy(this.currentEnemy);
        }else{ // No enemy ->
            this.handleWhenNoEnemy();
        }
        
        // Check if decisions have been modified
        if (FighterPlane.areMovementDecisionsChanged(startingDecisions, this.decisions)){
            this.movementModCount++;
        }
    }

    // TODO: Comments
    executeDecisions(){
        // Check shooting
        if (this.decisions["shoot"]){
            //console.log("Gonna shoot", this.shootLock.isReady() , !this.scene.isLocal() , activeGameMode.runsLocally())
            if (this.shootLock.isReady() && (!this.scene.isLocal() || activeGameMode.runsLocally())){
                this.shootLock.lock();
                this.shoot();
            }
        }

        // Change facing direction
        if (this.decisions["face"] != 0){
            this.face(this.decisions["face"] > 1);
        }

        // Adjust angle
        if (this.decisions["angle"] != 0){
            if (this.rotationCD.isReady()){
                this.rotationCD.lock();
                this.adjustAngle(this.decisions["angle"]);
            }
        }

        // Adjust throttle
        if (this.decisions["throttle"] != 0){
            this.adjustThrottle(this.decisions["throttle"]);
        }
    }

    // TODO: Comments
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "shoot_lock": this.shootLock.getTicksLeft(),
            "rotation_cd": this.rotationCD.getTicksLeft()
        }
        rep["biases"] = this.biases;
        rep["basic"] = {
            "id": this.id,
            "x": this.x,
            "y": this.y,
            "human": this.isHuman(),
            "plane_class": this.planeClass,
            "facing_right": this.facingRight,
            "angle": this.angle,
            "throttle": this.throttle,
            "speed": this.speed,
            "health": this.health,
            "starting_health": this.startingHealth,
            "dead": this.isDead()
        }
        rep["movement_mod_count"] = this.movementModCount;
        return rep;
    }

    // TODO: Comments
    fromJSON(rep, tickDifference=0){
        // This is always local being received from the server
        let takePosition = rep["movement_mod_count"] > this.movementModCount;
        if (this.getModel() == "p51_mustang"){
            //console.log(rep["movement_mod_count"], rep["decisions"]["throttle"], this.movementModCount, this.decisions["throttle"], rep["basic"]["throttle"], this.throttle);
        }
        if (takePosition){
            this.x = rep["basic"]["x"];
            this.y = rep["basic"]["y"];
            this.facingRight = rep["basic"]["facing_right"];
            this.angle = rep["basic"]["angle"];
            this.throttle = rep["basic"]["throttle"];
            this.speed = rep["basic"]["speed"];
            this.movementModCount = rep["movement_mod_count"];
            this.rotationCD.setTicksLeft(rep["locks"]["rotation_cd"]);
            
            // Approximate plane positions in current tick based on position in server tick
            if (tickDifference > 0){
                this.rollForward(tickDifference);
            }else if (tickDifference < 0){
                this.rollBackward(tickDifference);
            }
            
        }
        this.health = rep["basic"]["health"];
        this.dead = rep["basic"]["dead"];
        this.decisions = rep["decisions"];
        this.shootLock.setTicksLeft(rep["locks"]["shoot_lock"]);
    }

    // TODO: Comments
    initFromJSON(rep){
        this.id = rep["basic"]["id"];
        this.health = rep["basic"]["health"];
        this.dead = rep["basic"]["dead"];
        this.x = rep["basic"]["x"];
        this.y = rep["basic"]["y"];
        this.facingRight = rep["basic"]["facing_right"];
        this.angle = rep["basic"]["angle"];
        this.throttle = rep["basic"]["throttle"];
        this.speed = rep["basic"]["speed"];
        this.health = rep["basic"]["health"];
        this.startingHealth = rep["basic"]["starting_health"];
        this.dead = rep["basic"]["dead"];
        this.decisions = rep["decisions"];
        this.shootLock.setTicksLeft(rep["locks"]["shoot_lock"]);
        this.rotationCD.setTicksLeft(rep["locks"]["rotation_cd"]);
    }

    // TODO: Comments
    static fromJSON(rep, scene){
        let planeClass = rep["basic"]["plane_class"];
        let fp = new BiasedBotFighterPlane(planeClass, scene, rep["biases"], rep["angle"], rep["facing_right"], false);
        fp.initFromJSON(rep)
        return fp;
    }

    /*
        Method Name: handleWhenNoEnemy
        Method Parameters: None
        Method Description: Make decisions when there is no enemy to fight
        Method Return: void
    */
    handleWhenNoEnemy(){
        // No enemy -> make sure not to crash into the ground
        if (this.closeToGround() && angleBetweenCCWDEG(this.getNoseAngle(), 180, 359)){
            this.turnInDirection(90);
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
        if (distance > this.speed * PROGRAM_DATA["settings"]["enemy_disregard_distance_time_constant"] * PROGRAM_DATA["settings"]["turn_to_enemy_constant"] + this.biases["enemy_far_away_distance"]){
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
        if (angleBetweenCWDEG(angleDEG, rotateCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"])), rotateCCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"]))) && distance < this.getMaxSpeed() * PROGRAM_DATA["settings"]["evasive_speed_diff"] + this.biases["enemy_close_distance"]){
            this.evasiveManeuver();
            return;
        }
        // If on a movement cooldown then return because nothing to do
        if (this.tickCD-- > 0){
            return;
        }
        
        // Not doing evausive maneuevers

        // If we have been chasing the enemy non-stop for too long at a close distance then move away (circles)
        if (this.ticksOnCourse >= PROGRAM_DATA["ai"]["fighter_plane"]["max_ticks_on_course"] + this.biases["max_ticks_on_course"]){
            this.tickCD = PROGRAM_DATA["ai"]["fighter_plane"]["tick_cd"] + this.biases["ticks_cooldown"];
            this.ticksOnCourse = 0;
        }
        this.turningDirection = null;
        this.ticksOnCourse += 1;
        this.turnInDirection(angleDEG);
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
        this.decisions["angle"] = this.turningDirection;
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
        Method Name: closeToGround
        Method Parameters: None
        Method Description: Determine if the plane is close to the ground
        Method Return: True if close to the ground, false if not close
    */
    closeToGround(){
        return this.y < PROGRAM_DATA["settings"]["close_to_ground_constant"] * this.speed + this.biases["close_to_ground"];
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
            this.decisions["face"] = -1;
            return;
        }
        // If facing left and the angle to turn to is very far but close if the plane turned right
        else if (!this.facingRight && angleBetweenCCWDEG(angleDEG, 295 + this.biases["flip_direction_lb"], 45 + this.biases["flip_direction_ub"]) && angleBetweenCCWDEG(angleDEG, 135 + this.biases["flip_direction_lb"], 225 + this.biases["flip_direction_ub"])){
            this.decisions["throttle"] = 1;
            return;
        }
        
        let newAngleCW = fixDegrees(this.getNoseAngle() + 1);
        let newAngleCCW = fixDegrees(this.getNoseAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);
        // If the angle of the plane currently is very close to the desired angle, not worth moving
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < PROGRAM_DATA["settings"]["min_angle_to_adjust"] + this.biases["min_angle_to_adjust"] && calculateAngleDiffDEG(newAngleCCW, angleDEG) < PROGRAM_DATA["settings"]["min_angle_to_adjust"] + this.biases["min_angle_to_adjust"]){
            return;
        }

        // The clockwise distance is less than the counter clockwise difference and facing right then turn clockwise 
        if (dCW < dCCW && this.facingRight){
            this.decisions["angle"] = -1;
        }
        // The clockwise distance is less than the counter clockwise difference and facing left then turn counter clockwise 
        else if (dCW < dCCW && !this.facingRight){
            this.decisions["angle"] = 1;
        }
        // The counter clockwise distance is less than the clockwise difference and facing right then turn counter clockwise 
        else if (dCCW < dCW && this.facingRight){
            this.decisions["angle"] = 1;
        }
        // The counter clockwise distance is less than the clockwise difference and facing left then turn clockwise 
        else if (dCCW < dCW && !this.facingRight){
            this.decisions["angle"] = -1;
        }
        // Otherwise just turn clockwise (Shouldn't actually be possible?)
        else{
            this.decisions["angle"] = 1;
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
            this.decisions["shoot"] = true;
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
            if (entity instanceof Plane && !this.onSameTeam(entity) && entity.isAlive()){
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
        if (this.currentEnemy != null && this.currentEnemy.isAlive() && this.distance(this.currentEnemy) <= (PROGRAM_DATA["settings"]["enemy_disregard_distance_time_constant"] + this.biases["enemy_disregard_distance_time_constant"]) * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;

        // Loop through all enemies and determine a score for being good to attack
        
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            let score = BiasedBotFighterPlane.calculateEnemyScore(distance, BiasedBotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID()) * this.biases["enemy_taken_distance_multiplier"]);
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "enemy": enemy,
                    "score": score
                }
            }
        }
        
        // If none found then do nothing
        if (bestRecord == null){ return; }
        this.currentEnemy = bestRecord["enemy"];
    }

    /*
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return PROGRAM_DATA["settings"]["shoot_distance_constant"] * PROGRAM_DATA["bullet_data"]["speed"] + this.biases["max_shooting_distance"];
    }

    /*
        Method Name: hasCurrentEnemy
        Method Parameters: None
        Method Description: Determine if there is currently a current enemy
        Method Return: True if has an enemy (and they exist), otherwise false
    */
    hasCurrentEnemy(){
        return this.currentEnemy != null && this.currentEnemy.isAlive();
    }

    /*
        Method Name: getCurrentEnemy
        Method Parameters: None
        Method Description: Get the current enemy
        Method Return: Plane
    */
    getCurrentEnemy(){
        return this.currentEnemy;
    }

    /*
        Method Name: createBiasedPlane
        Method Parameters: 
            planeClass:
                A string representing the type of the plane
            scene:
                A scene objet related to the plane
            difficulty:
                The current difficulty setting
            autonomous:
                Whether or not the plane can make decisions
        Method Description: Return a new biased plane
        Method Return: BiasedBotFighterPlane
    */
    static createBiasedPlane(planeClass, scene, difficulty, autonomous=true){
        let biases = BiasedBotFighterPlane.createBiases(difficulty);
        return new BiasedBotFighterPlane(planeClass, scene, biases, 0, true, autonomous);
    }

    /*
        Method Name: createBiases
        Method Parameters:
            difficulty:
                The difficulty setting related to the plane
        Method Description: Creates a set of biases for a new plane
        Method Return: JSON Object
    */
    static createBiases(difficulty){
        let biasRanges = PROGRAM_DATA["ai"]["fighter_plane"]["bias_ranges"][difficulty];
        let biases = {};
        for (let [key, bounds] of Object.entries(biasRanges)){
            let upperBound = bounds["upper_range"]["upper_bound"];
            let lowerBound = bounds["upper_range"]["lower_bound"];
            let upperRangeSize = bounds["upper_range"]["upper_bound"] - bounds["upper_range"]["lower_bound"];
            let lowerRangeSize = bounds["lower_range"]["upper_bound"] - bounds["lower_range"]["lower_bound"];
            // Chance of using the lower range instead of the upper range
            if (randomFloatBetween(0, upperRangeSize + lowerRangeSize) < lowerRangeSize){
                upperBound = bounds["lower_range"]["upper_bound"];
                lowerBound = bounds["lower_range"]["lower_bound"];
            }
            let usesFloatValue = Math.floor(upperBound) != upperBound || Math.floor(lowerBound) != lowerBound;
            biases[key] = usesFloatValue ? randomFloatBetween(lowerBound, upperBound) : randomNumberInclusive(lowerBound, upperBound);    
        }
        return biases;
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
        return focusedCount(scene, enemyID, myID) == 0;
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
        for (let plane of scene.getPlanes()){
            if (plane instanceof BiasedBotFighterPlane && plane.getID() != myID && plane.getCurrentEnemy() != null && plane.getCurrentEnemy().getID() == enemyID){
                count += 1;
            }
        }
        return count;
    }

    // TODO: Comments
    static calculateEnemyScore(distance, focusedCount){
        return distance + focusedCount * PROGRAM_DATA["settings"]["focused_count_distance_equivalent"];
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotFighterPlane;
}