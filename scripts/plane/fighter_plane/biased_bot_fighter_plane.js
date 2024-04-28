// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    FighterPlane = require("./fighter_plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    displacementToRadians = helperFunctions.displacementToRadians;
    angleBetweenCCWRAD = helperFunctions.angleBetweenCCWRAD;
    calculateAngleDiffCWRAD = helperFunctions.calculateAngleDiffCWRAD;
    calculateAngleDiffCCWRAD = helperFunctions.calculateAngleDiffCCWRAD;
    rotateCWRAD = helperFunctions.rotateCWRAD;
    rotateCCWRAD = helperFunctions.rotateCCWRAD;
    randomNumberInclusive = helperFunctions.randomNumberInclusive;
    randomFloatBetween = helperFunctions.randomFloatBetween;
    toRadians = helperFunctions.toRadians;
    fixRadians = helperFunctions.fixRadians;
    copyObject = helperFunctions.copyObject;
    toFixedRadians = helperFunctions.toFixedRadians;
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
            gamemode:
                A gamemode object related to the fighter plane
            biases:
                An object containing keys and bias values
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, biases, autonomous=true){
        super(planeClass, gamemode, autonomous);
        this.currentEnemy = null;
        this.turningDirection = null;
        this.evasiveTicksCD = 0;
        this.ticksOnAttack = 0;
        this.tickCD = 0;
        this.biases = biases;
        this.updateEnemyLock = new TickLock(PROGRAM_DATA["ai"]["update_enemy_cooldown"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.throttle = Math.floor(this.throttle + this.biases["throttle"]); // Throttle must be an integer
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.startingHealth = this.health;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.updateEnemyLock.tick();
        super.tick();
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for the plane for the next tick
        Method Return: void
    */
    makeDecisions(){
        // Sometimes the bot is controlled externally so doesn't need to make its own decisions
        if (!this.isAutonomous()){
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
            this.decisions["last_movement_mod_tick"] = this.getCurrentTicks();
        }
    }

    /*
        Method Name: executeDecisions
        Method Parameters: None
        Method Description: Take actions based on saved decisions
        Method Return: void
    */
    executeDecisions(){
        // Check shooting
        if (this.decisions["shoot"]){
            if (this.shootLock.isReady() && this.gamemode.runsLocally()){
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
            this.adjustAngle(this.decisions["angle"]);
        }

        // Adjust throttle
        if (this.decisions["throttle"] != 0){
            this.adjustThrottle(this.decisions["throttle"]);
        }
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the biased bot fighter plane
        Method Return: JSON Object
    */
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "shoot_lock": this.shootLock.getTicksLeft()
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
        return rep;
    }

    /*
        Method Name: initFromJSON
        Method Parameters:
            rep:
                A json representation of a biased bot fighter plane
        Method Description: Sets attributes of a biased bot fighter plane from a JSON representation
        Method Return: void
    */
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
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep:
                A json representation of a biased bot fighter plane
            gamemode:
                A gamemode object
            autonomous:
                Whether or not the new plane can make its own decisions (Boolean)
        Method Description: Creates a new Biased Bot Fighter Plane
        Method Return: BiasedBotFighterPlane
    */
    static fromJSON(rep, gamemode){
        let planeClass = rep["basic"]["plane_class"];
        let fp = new BiasedBotFighterPlane(planeClass, gamemode, rep["biases"], false); // In all circumstances when loading a bot from a JSON it will not be autonomous
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
        if (this.closeToGround() && angleBetweenCCWRAD(this.getNoseAngle(), toRadians(180.01), toRadians(359.99))){
            this.turnInDirection(toRadians(90));
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
        let angleRAD = displacementToRadians(enemyXDisplacement, enemyYDisplacement);
        
        // Bias
        angleRAD = fixRadians(angleRAD + toRadians(this.biases["angle_to_enemy"]));
        let angleDifferenceRAD = calculateAngleDiffRAD(shootingAngle, angleRAD);

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleRAD, distanceToEnemy, enemy);
        
        // Shoot if the enemy is in front
        let hasFiredShot = this.tryToShootAtEnemy(angleDifferenceRAD, enemy.getHitbox().getRadius(), distanceToEnemy);
        if (hasFiredShot){ return; }

        // Look for other enemies that aren't the primary focus and if they are infront of the plane then shoot
        for (let secondaryEnemy of this.getEnemyList()){
            if (hasFiredShot){ break; }
            enemyX = secondaryEnemy.getX();
            enemyY = secondaryEnemy.getY();
            enemyXDisplacement = enemyX - myX;
            enemyYDisplacement = enemyY - myY;
            angleRAD = displacementToRadians(enemyXDisplacement, enemyYDisplacement);
            angleRAD = fixRadians(angleRAD + toRadians(this.biases["angle_to_enemy"]));
            angleDifferenceRAD = calculateAngleDiffRAD(shootingAngle, angleRAD);
            distanceToEnemy = this.distance(secondaryEnemy);
            hasFiredShot = this.tryToShootAtEnemy(angleDifferenceRAD, secondaryEnemy.getHitbox().getRadius(), distanceToEnemy);
        }
    }

    /*
        Method Name: handleMovement
        Method Parameters:
            angleRAD:
                An angle from the current location to that of the enemy
            distance:
                The current distance from the current location to the enemy
            enemy:
                An enemy fighter plane
        Method Description: Decide how to move given the presence of an enemy.
        Method Return: void
    */
    handleMovement(angleRAD, distance, enemy){
        // If facing downwards and close to the ground then turn upwards
        if (this.closeToGround() && angleBetweenCCWRAD(this.getNoseAngle(), toRadians(180.01), toRadians(359.99))){
            // Bias
            this.turnInDirection(fixRadians(90 + toRadians(this.biases["angle_from_ground"])));
            // If not fighting an enemy then roll over the plane if needed
            this.correctFacingDirection();
            return;
        }
        // Point to enemy when very far away
        if (distance > this.speed * PROGRAM_DATA["settings"]["enemy_disregard_distance_time_constant"] * PROGRAM_DATA["settings"]["turn_to_enemy_constant"] + this.biases["enemy_far_away_distance"]){
            this.turnInDirection(angleRAD);
            this.turningDirection = null; // Evasive maneuevers cut off if far away
            // If not fighting an enemy then roll over the plane if needed
            this.correctFacingDirection();
            return;
        }
        // Else at a medium distance to enemy
        this.handleClose(angleRAD, distance, enemy);
    }


    /*
        Method Name: handleClose
        Method Parameters:
            angleFromMeToEnemyRAD:
                An angle from the current location to that of the enemy
            distance:
                The current distance from the current location to the enemy
            enemy:
                An enemy fighter plane
        Method Description: Decide how to handle an enemy is that very close by
        Method Return: void
    */
    handleClose(angleFromMeToEnemyRAD, distance, enemy){
        let myAngleRAD = this.getNoseAngle();
        let enemyAngleRAD = enemy.getNoseAngle();
        let enemyIsBehindMe = angleBetweenCCWRAD(angleFromMeToEnemyRAD, rotateCCWRAD(myAngleRAD, fixRadians(toRadians(135) + toRadians(this.biases["enemy_behind_angle"]))), rotateCWRAD(myAngleRAD, fixRadians(toRadians(135) + toRadians(this.biases["enemy_behind_angle"]))));
        let enemyAngleToMe = enemy.angleToOtherRAD(this);
        let enemyIsFacingMe = angleBetweenCCWRAD(enemyAngleRAD, rotateCCWRAD(enemyAngleToMe, toRadians(10)), rotateCWRAD(enemyAngleToMe, toRadians(10)));
        
        // If continuing evasive OR (enemy is behind me, facing me, and close) then do evasive manuevers
        let continueEvasive = (this.evasiveTicksCD == 0) ? false : (this.evasiveTicksCD-- > 0);
        if (continueEvasive || (enemyIsBehindMe && enemyIsFacingMe && distance < this.getMaxSpeed() * PROGRAM_DATA["settings"]["evasive_speed_diff"] + this.biases["enemy_close_distance"])){
            this.evasiveManeuver();
            return;
        }

        // If on a movement cooldown then return because nothing to do
        if (this.tickCD-- > 0){
            return;
        }
        
        // Not doing evausive maneuevers

        // If we have been chasing the enemy non-stop for too long at a close distance then move away (circles)
        if (this.ticksOnAttack >= PROGRAM_DATA["ai"]["fighter_plane"]["max_ticks_on_course"] + this.biases["max_ticks_on_course"]){
            this.tickCD = PROGRAM_DATA["ai"]["fighter_plane"]["tick_cd"] + this.biases["ticks_cooldown"];
            this.ticksOnAttack = 0;
        }

        this.turningDirection = null;
        this.ticksOnAttack += 1;
        this.turnInDirection(angleFromMeToEnemyRAD);
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
            this.evasiveTicksCD = PROGRAM_DATA["ai"]["fighter_plane"]["evasive_ticks_cd"];
        }
        this.decisions["angle"] = this.turningDirection * toRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]);
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
            angleRAD:
                The angle to turn to (radians)
        Method Description: Turn the plane in a given direction
        Method Return: void
    */
    turnInDirection(angleRAD){
        // Determine if we need to switch from left to right
        let myAngle = this.getNoseAngle();
        let dCW = calculateAngleDiffCWRAD(myAngle, angleRAD);
        let dCCW = calculateAngleDiffCCWRAD(myAngle, angleRAD);
        let angleDifferenceRAD = calculateAngleDiffRAD(myAngle, angleRAD);
        // The clockwise distance is less than the counter clockwise difference and facing right then turn clockwise 
        if (dCW < dCCW && this.facingRight){
            this.decisions["angle"] = -1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), angleDifferenceRAD);
        }
        // The clockwise distance is less than the counter clockwise difference and facing left then turn counter clockwise 
        else if (dCW < dCCW && !this.facingRight){
            this.decisions["angle"] = 1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), angleDifferenceRAD);
        }
        // The counter clockwise distance is less than the clockwise difference and facing right then turn counter clockwise 
        else if (dCCW < dCW && this.facingRight){
            this.decisions["angle"] = 1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), angleDifferenceRAD);
        }
        // The counter clockwise distance is less than the clockwise difference and facing left then turn clockwise 
        else if (dCCW < dCW && !this.facingRight){
            this.decisions["angle"] = -1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), angleDifferenceRAD);
        }
        // Otherwise just turn clockwise dCW && dCCW are equal?
        else{
            this.decisions["angle"] = 1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), angleDifferenceRAD);
        }
    }

    /*
        Method Name: tryToShootAtEnemy
        Method Parameters:
            angleDifferenceRAD:
                Difference between current angle and the angle to the enemy (Radians)
            enemyRadius:
                The radius of the enemy's hitbox
            distanceToEnemy:
                The distance to the enemy
        Method Description: Turn the plane in a given direction. True if shot, false if not.
        Method Return: boolean
    */
    tryToShootAtEnemy(angleDifferenceRAD, enemyRadius, distanceToEnemy){
        let angleAllowanceAtRangeRAD = Math.abs(Math.atan(enemyRadius / distanceToEnemy));
        // If the angle & distance are acceptable then shoot
        if (angleDifferenceRAD < fixRadians(angleAllowanceAtRangeRAD + toRadians(this.biases["angle_allowance_at_range"])) && distanceToEnemy < this.getMaxShootingDistance()){
            // Check gun heat
            let blockedByGunHeat = false;
            let currentThreshold = this.gunHeatManager.getThreshold();
            // Bots won't shoot far away enemies if their gun is too hot, its a waste
            if (currentThreshold == "threshold_3"){
                blockedByGunHeat = distanceToEnemy >= PROGRAM_DATA["ai"]["threshold_3_distance"];
            }else if (currentThreshold == "threshold_2"){
                blockedByGunHeat = distanceToEnemy >= PROGRAM_DATA["ai"]["threshold_2_distance"];
            }
            this.decisions["shoot"] = !blockedByGunHeat;
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
        let entities = this.gamemode.getTeamCombatManager().getLivingPlanes();
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
            let score = BiasedBotFighterPlane.calculateEnemyScore(distance, BiasedBotFighterPlane.focusedCount(this.gamemode, enemy.getID(), this.getID()) * this.biases["enemy_taken_distance_multiplier"]);
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
            gamemode:
                A gamemode objet related to the plane
            difficulty:
                The current difficulty setting
            autonomous:
                Whether or not the plane can make decisions
        Method Description: Return a new biased plane
        Method Return: BiasedBotFighterPlane
    */
    static createBiasedPlane(planeClass, gamemode, difficulty, autonomous=true){
        let biases = BiasedBotFighterPlane.createBiases(difficulty);
        return new BiasedBotFighterPlane(planeClass, gamemode, biases, autonomous);
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
            gamemode:
                A gamemode object related to the fighter plane
            enemyID:
                A string ID of the enemy plane
            myID:
                A string ID of the plane making the inquiry
        Method Description: Determines if another plane is focused on an enemy that "I" am thinking about focusing on
        Method Return: boolean, True if another plane has the enemyID as a current enemy, false otherwise
    */
    static isFocused(gamemode, enemyID, myID){
        return focusedCount(gamemode, enemyID, myID) == 0;
    }

    /*
        Method Name: focusedCount
        Method Parameters:
            gamemode:
                A gamemode object related to the fighter plane
            enemyID:
                A string ID of the enemy plane
            myID:
                A string ID of the plane making the inquiry
        Method Description: Determines how many other planes are focused on an enemy that "I" am thinking about focusing on
        Method Return: int
    */
    static focusedCount(gamemode, enemyID, myID){
        let count = 0;
        for (let plane of gamemode.getTeamCombatManager().getLivingPlanes()){
            if (plane instanceof BiasedBotFighterPlane && plane.getID() != myID && plane.getCurrentEnemy() != null && plane.getCurrentEnemy().getID() == enemyID){
                count += 1;
            }
        }
        return count;
    }

    /*
        Method Name: calculateEnemyScore
        Method Parameters:
            distance:
                The distance between a plane and an enemy
            focusedCount:
                The number of planes focused on this enemy
        Method Description: Comes up with a score for how valuable this enemy is to attack
        Method Return: Number
    */
    static calculateEnemyScore(distance, focusedCount){
        return distance + focusedCount * PROGRAM_DATA["settings"]["focused_count_distance_equivalent"];
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotFighterPlane;
}