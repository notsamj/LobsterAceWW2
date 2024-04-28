// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    BomberPlane = require("./bomber_plane.js");
    BiasedBotFighterPlane = require("../fighter_plane/biased_bot_fighter_plane.js");
    BiasedBotBomberTurret = require("../../turret/biased_bot_bomber_turret.js");
    BiasedBotBomberPlane = require("./biased_bot_bomber_plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    displacementToRadians = helperFunctions.displacementToRadians;
    angleBetweenCCWRAD = helperFunctions.angleBetweenCCWRAD;
    calculateAngleDiffRAD = helperFunctions.calculateAngleDiffRAD;
    calculateAngleDiffCWRAD = helperFunctions.calculateAngleDiffCWRAD;
    calculateAngleDiffCCWRAD = helperFunctions.calculateAngleDiffCCWRAD;
}

/*
    Class Name: BiasedDogfightBotBomberPlane
    Description: A subclass of the BomberPlane that is a bot with biases for its actions
*/
class BiasedDogfightBotBomberPlane extends BiasedBotBomberPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            gamemode:
                A gamemode object related to the bomber plane
            biases:
                An object containing keys and bias values
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, biases, autonomous=true){
        super(planeClass, gamemode, biases, autonomous);
        this.currentEnemy = null;
        this.friendlyCenter = {"empty": true};
        this.updateEnemyLock = new TickLock(PROGRAM_DATA["ai"]["update_enemy_cooldown"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.updateFriendlyCenterLock = new TickLock(PROGRAM_DATA["ai"]["bomber_plane"]["update_friendly_center"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.enemyList = [];
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the biased bot bomber plane
        Method Return: JSON Object
    */
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
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

        // Create a json rep of all guns
        rep["guns"] = [];
        for (let gun of this.guns){
            rep["guns"].push(gun.toJSON());
        }

        return rep;
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep:
                A json representation of a biased bot bomber plane
            gamemode:
                A Scene object
            autonomous:
                Whether or not the new plane can make its own decisions (Boolean)
        Method Description: Creates a new Biased Bot Bomber Plane
        Method Return: BiasedDogfightBotBomberPlane
    */
    static fromJSON(rep, gamemode, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let bp = new BiasedDogfightBotBomberPlane(planeClass, gamemode, rep["biases"], autonomous);
        bp.initFromJSON(rep)
        return bp;
    }

    /*
        Method Name: initFromJSON
        Method Parameters:
            rep:
                A json representation of a biased bot bomber plane
        Method Description: Sets attributes of a biased bot bomber plane from a JSON representation
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
        this.decisions = rep["decisions"];
        this.bombLock.setTicksLeft(rep["locks"]["bomb_lock"]);  
        for (let i = 0; i < this.guns.length; i++){
            this.guns[i].initFromJSON(rep["guns"][i]);
        }
    }

    /*
        Method Name: getFriendlyList
        Method Parameters: None
        Method Description: Creates a list of all friendly planes
        Method Return: List of planes
    */
    getFriendlyList(){
        let planes = this.gamemode.getTeamCombatManager().getLivingPlanes();
        let friendlies = [];
        for (let plane of planes){
            if (plane instanceof Plane && this.onSameTeam(plane) && plane.isAlive()){
                friendlies.push(plane);
            }
        }
        return friendlies;
    }


    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.updateEnemyLock.tick();
        this.updateFriendlyCenterLock.tick();
        // Tick the locks on the guns
        for (let gun of this.guns){
            gun.tick();
        }

        // Do movement stuff
        super.tick();
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for the plane for the next tick
        Method Return: void
    */
    makeDecisions(){
        // If not allowed to make decisions -> not make any
        this.resetDecisions();
        if (!this.isAutonomous()){ return; }
        // Always look for enemies for the turret or for else
        if (this.updateEnemyLock.isReady()){
            this.updateEnemyLock.lock();
            // Check if the selected enemy should be changed
            this.updateEnemy();
        }

        // Find new friendly cetner
        if (this.updateFriendlyCenterLock.isReady()){
            this.updateFriendlyCenterLock.lock();
            this.findFriendlyCenter();
        }
        let centerOfFriendyMass = this.friendlyCenter;
        let decidedOnMovement = false;
        // If there are friendlies then the top priority is to be near them
        if (!centerOfFriendyMass["empty"]){
            let distance = this.distanceToPoint(centerOfFriendyMass["center_x"], centerOfFriendyMass["center_y"]);
            // If we are far from friendlies then move to their center
            if (distance > PROGRAM_DATA["settings"]["bomber_distance_from_friendlies_dogfight"]){
                let angleRAD = displacementToRadians(centerOfFriendyMass["center_x"] - this.x, centerOfFriendyMass["center_y"] - this.y);
                this.turnInDirection(angleRAD);
                decidedOnMovement = true;
            }
        }
        // If movement hasn't been decided on already then maybe move based on enemies
        if (!decidedOnMovement){
            // If there is an enemy then act accordingly
            if (this.hasCurrentEnemy()){
                let enemy = this.currentEnemy;
                this.handleEnemy(enemy);
            }else{ // No enemy -> make sure not to crash into the ground
                if (this.closeToGround() && angleBetweenCCWRAD(this.getNoseAngle(), toRadians(180.01), toRadians(359.99))){
                    this.turnInDirection(toRadians(90));
                }
            }
        }

        // roll over the plane if needed
        this.correctFacingDirection();

        // Let guns make decisions
        for (let gun of this.guns){
            gun.makeDecisions(this.enemyList);
        }
    }

    /*
        Method Name: resetDecisions
        Method Parameters: None
        Method Description: Resets the decisions so the planes actions can be chosen to reflect what it current wants to do rather than previously
        Method Return: void
    */
    resetDecisions(){
        this.decisions["face"] = 0;
        this.decisions["angle"] = 0;
    }

    /*
        Method Name: executeAttackingDecisions
        Method Parameters: None
        Method Description: Decide whether or not to shoot
        Method Return: void
    */
    executeAttackingDecisions(){
        // Let guns shoot
        for (let gun of this.guns){
            gun.executeDecisions();
        }
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
                Whether or not the plane can make its own decisions
        Method Description: Return the max shooting distance of this biased plane
        Method Return: BiasedDogfightBotBomberPlane
    */
    static createBiasedPlane(planeClass, gamemode, difficulty, autonomous){
        let biases = {};
        for (let [key, bounds] of Object.entries(PROGRAM_DATA["ai"]["bomber_plane"]["bias_ranges"][difficulty])){
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
        return new BiasedDogfightBotBomberPlane(planeClass, gamemode, biases, autonomous); // Temporary values some will be changed
    }

    /*
        Method Name: findFriendlyCenter
        Method Parameters: None
        Method Description: Finds the center location of all friendly planes (excluding bombers)
        Method Return: JSON Object
    */
    findFriendlyCenter(){
        let totalX = 0;
        let totalY = 0;
        let friendlies = this.getFriendlyList();
        if (friendlies.length == 0){
            this.friendlyCenter = {"empty": true};
            return;
        }
        let fC = 0;
        // Loop through all friendlies and determine the center of them
        for (let friendly of friendlies){
            if (friendly instanceof BomberPlane){ continue; } // bomber's don't count so we don't end up them all going to eachother
            totalX += friendly.getX();
            totalY += friendly.getY();
            fC++;
        }
        if (fC == 0){ 
            this.friendlyCenter = {"empty": true};
            return;
        }
        this.friendlyCenter = {"empty": false, "center_x": totalX/fC + this.biases["friendly_center_x_offset"], "center_y": totalY/fC + this.biases["friendly_center_y_offset"]};
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemy != null && this.currentEnemy.isAlive() && this.distance(this.currentEnemy) <= PROGRAM_DATA["settings"]["enemy_disregard_distance_time_constant"] * this.speed){
            return;
        }
        this.enemyList = this.getEnemyList();
        let bestRecord = null;
        // Loop through all enemies and determine a score for being good to attack
        for (let enemy of this.enemyList){
            let distance = this.distance(enemy);
            let focusedCountMultiplier = (BiasedBotFighterPlane.focusedCount(this.gamemode, enemy.getID(), this.getID()) * PROGRAM_DATA["settings"]["ENEMY_DISTANCE_SCORE_MULTIPLIER_BASE"]);
            if (focusedCountMultiplier < 1 ){ focusedCountMultiplier = 1; }
            let score = distance / focusedCountMultiplier; // Most focusing the better (from POV of bomber)

            // If this new enemy is better
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "enemy": enemy,
                    "score": score
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemy = bestRecord["enemy"];
    }

    /*
        Method Name: handleEnemy
        Method Parameters:
            enemy:
                An object of an enemy plane
        Method Description: Decide what to do when given an enemy to attack. Can move and can shoot.
        Method Return: void
    */
    handleEnemy(enemy){
        // Separate into two things
        let myX = this.getX();
        let myY = this.getY();
        let enemyX = enemy.getX();
        let enemyY = enemy.getY();
        let enemyXDisplacement = enemyX - myX;
        let enemyYDisplacement = enemyY - myY;
        let distanceToEnemy = this.distance(enemy);

        // To prevent issues in calculating angles, if the enemy is ontop of you no need to move
        if (distanceToEnemy < 1){
            return;
        }
        // Otherwise enemy is not too much "on top" of the bot
        let angleRAD = displacementToRadians(enemyXDisplacement, enemyYDisplacement);

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleRAD, distanceToEnemy, enemy);
    }

    /*
        Method Name: handleMovement
        Method Parameters:
            angleRAD:
                An angle from the current location to that of the enemy (Radians)
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
            this.turnInDirection(toRadians(90));
            return;
        }

        // Point to enemy I guess. It's a silly situation, no good answer
        this.turnInDirection(angleRAD);
    }

    /*
        Method Name: closeToGround
        Method Parameters: None
        Method Description: Determine if the plane is close to the ground
        Method Return: True if close to the ground, false if not close
    */
    closeToGround(){
        return this.y < PROGRAM_DATA["settings"]["close_to_ground_constant"] * this.speed;
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
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedDogfightBotBomberPlane;
}