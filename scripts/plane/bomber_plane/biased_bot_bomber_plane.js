// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    BomberPlane = require("./bomber_plane.js");
    BiasedBotFighterPlane = require("../fighter_plane/biased_bot_fighter_plane.js");
    BiasedBotBomberTurret = require("../../turret/biased_bot_bomber_turret.js");
    helperFunctions = require("../../general/helper_functions.js");
    displacementToDegrees = helperFunctions.displacementToDegrees;
    angleBetweenCCWDEG = helperFunctions.angleBetweenCCWDEG;
    calculateAngleDiffDEG = helperFunctions.calculateAngleDiffDEG;
    calculateAngleDiffDEGCW = helperFunctions.calculateAngleDiffDEGCW;
    calculateAngleDiffDEGCCW = helperFunctions.calculateAngleDiffDEGCCW;
}

/*
    Class Name: BiasedBotBomberPlane
    Description: A subclass of the BomberPlane that is a bot with biases for its actions
*/
class BiasedBotBomberPlane extends BomberPlane {
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
            biases:
                An object containing keys and bias values
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle, facingRight, biases, autonomous=true){
        super(planeClass, scene, angle, facingRight, autonomous);
        this.currentEnemy = null;
        this.udLock = new TickLock(40 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.updateEnemyLock = new TickLock(PROGRAM_DATA["ai"]["fighter_plane"]["update_enemy_cooldown"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.biases = biases;
        this.generateGuns(biases);
        this.throttle += this.biases["throttle"];
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.startingHealth = this.health;
        this.autonomous = autonomous;
        this.enemyList = [];
    }

    // TODO: Comments
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "ud_lock": this.udLock.getTicksLeft()
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

        // Create a json rep of all guns
        rep["guns"] = [];
        for (let gun of this.guns){
            rep["guns"].push(gun.toJSON());
        }

        return rep;
    }

    // TODO: Comments
    static fromJSON(rep, scene, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let bp = new BiasedBotBomberPlane(planeClass, scene, 0, true, rep["biases"], rep["angle"], rep["facing_right"], autonomous);
        bp.initFromJSON(rep)
        return bp;
    }

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
            this.guns[i].fromJSON(rep["guns"][i]);
        }
    }

    /*
        Method Name: getFriendlyList
        Method Parameters: None
        Method Description: Creates a list of all friendly planes
        Method Return: List of planes
    */
    getFriendlyList(){
        let planes = this.scene.getPlanes();
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
        Method Parameters:
            timeDiffMS:
                The time between ticks
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(timeDiffMS){
        this.udLock.tick();
        this.updateEnemyLock.tick();
        for (let gun of this.guns){
            gun.tick();
        }
        super.tick(timeDiffMS);
    }

    // TODO: Comments
    makeDecisions(){
        // If not allowed to make decisions -> not make any
        this.resetDecisions();
        if (!this.autonomous){ return; }
        let centerOfFriendyMass = this.findFriendlyCenter();
        // If there are friendlies then the top priority is to be near them
        if (!centerOfFriendyMass["empty"]){
            let distance = this.distanceToPoint(centerOfFriendyMass["centerX"], centerOfFriendyMass["centerY"]);
            // If we are far from friendlies then move to their center
            if (distance > PROGRAM_DATA["settings"]["bomber_distance_from_friendlies_dogfight"]){
                let angleDEG = displacementToDegrees(centerOfFriendyMass["centerX"] - this.x, centerOfFriendyMass["centerY"] - this.y);
                this.turnInDirection(angleDEG);
            }
        }
        // Otherwise we are just looking for enemies
        if (this.updateEnemyLock.isReady()){
            this.updateEnemyLock.lock();
            // Check if the selected enemy should be changed
            this.updateEnemy();
        }
        // If there is an enemy then act accordingly
        if (this.hasCurrentEnemy()){
            let enemy = this.currentEnemy;
            this.handleEnemy(enemy);
        }else{ // No enemy -> make sure not to crash into the ground
            if (this.closeToGround() && angleBetweenCCWDEG(this.getNoseAngle(), 180, 359)){
                this.turnInDirection(90);
            }
        }

        // Let guns make decisions
        for (let gun of this.guns){
            gun.makeDecisions(this.enemyList);
        }
    }

    // TODO: Comments
    resetDecisions(){
        this.decisions["face"] = 0;
        this.decisions["angle"] = 0;
    }

    // TODO: Comments
    executeDecisions(){
        // Change facing direction
        if (this.decisions["face"] != 0){
            this.face(this.decisions["face"] == 1 ? true : false);
        }

        // Adjust angle
        if (this.decisions["angle"] != 0){
            if (this.udLock.isReady()){
                this.udLock.lock();
                this.adjustAngle(this.decisions["angle"]);
            }
        }

        // Let guns shoot
        for (let gun of this.guns){
            gun.executeDecisions();
        }
    }

    /*
        Method Name: generateGuns
        Method Parameters: None
        Method Description: Create gun objects for the plane
        Method Return: void
    */
    generateGuns(biases){
        this.guns = [];
        for (let gunObj of PROGRAM_DATA["plane_data"][this.planeClass]["guns"]){
            this.guns.push(BiasedBotBomberTurret.create(gunObj, this.scene, this, biases, this.autonomous));
        }
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
                Whether or not the plane can make its own decisions
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    static createBiasedPlane(planeClass, scene, difficulty, autonomous){
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
        return new BiasedBotBomberPlane(planeClass, scene, true, 0, biases, autonomous); // Temporary values some will be changed
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
            return {"empty": true};
        }
        let fC = 0;
        // Loop through all friendlies and determine the center of them
        for (let friendly of friendlies){
            if (friendly instanceof BomberPlane){ continue; } // bomber's don't count so we don't end up in a loop
            totalX += friendly.getX();
            totalY += friendly.getY();
            fC++;
        }
        if (fC == 0){ return {"empty": true}; }
        return {"empty": false, "centerX": totalX/fC + this.biases["friendly_center_x_offset"], "centerY": totalY/fC + this.biases["friendly_center_y_offset"]};
    }

    /*
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return PROGRAM_DATA["settings"]["shoot_distance_constant"] * PROGRAM_DATA["bullet_data"]["speed"] + this.biases["max_shooting_distance_offset"];
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
            let focusedCountMultiplier = (BiasedBotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID()) * PROGRAM_DATA["settings"]["ENEMY_DISTANCE_SCORE_MULTIPLIER_BASE"]);
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
        let shootingAngle = this.getNoseAngle();
        let angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
        let angleDifference = calculateAngleDiffDEG(shootingAngle, angleDEG);

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleDEG, distanceToEnemy, enemy);
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

        // Point to enemy I guess. It's a silly situation, no good answer
        this.turnInDirection(angleDEG);
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
            this.decisions["face"] = 0;
            return;
        }
        // If facing left and the angle to turn to is very far but close if the plane turned right
        else if (!this.facingRight && angleBetweenCCWDEG(angleDEG, 295, 45) && angleBetweenCCWDEG(angleDEG, 135, 225)){
            this.decisions["face"] = 1;
            return;
        }

        if (this.udLock.notReady()){ return; }
        this.udLock.lock();
        let newAngleCW = fixDegrees(this.getNoseAngle() + 1);
        let newAngleCCW = fixDegrees(this.getNoseAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);
        let angleDiff = calculateAngleDiffDEG(angleDEG, this.getNoseAngle());

        // If the angle of the plane currently is very close to the desired angle, not worth moving
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < PROGRAM_DATA["settings"]["min_angle_to_adjust"] && calculateAngleDiffDEG(newAngleCCW, angleDEG) < PROGRAM_DATA["settings"]["min_angle_to_adjust"]){
            return;
        }
        // The clockwise distance is less than the counter clockwise difference and facing right then turn clockwise 
        if (dCW < dCCW && this.facingRight){
            this.decisions["angle"] = -1 * Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], Math.floor(angleDiff));
        }
        // The clockwise distance is less than the counter clockwise difference and facing left then turn counter clockwise 
        else if (dCW < dCCW && !this.facingRight){
            this.decisions["angle"] = 1 * Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], Math.floor(angleDiff));
        }
        // The counter clockwise distance is less than the clockwise difference and facing right then turn counter clockwise 
        else if (dCCW < dCW && this.facingRight){
            this.decisions["angle"] = 1 * Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], Math.floor(angleDiff));
        }
        // The counter clockwise distance is less than the clockwise difference and facing left then turn clockwise 
        else if (dCCW < dCW && !this.facingRight){
            this.decisions["angle"] = -1 * Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], Math.floor(angleDiff));
        }
        // Otherwise just turn clockwise (Shouldn't actually be possible?)
        else{
            this.decisions["angle"] = 1 * Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], Math.floor(angleDiff));
        }
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
        let me = this;
        return enemies.sort((enemy1, enemy2) => {
            let d1 = enemy1.distance(me);
            let d2 = enemy2.distance(me);
            if (d1 < d2){
                return -1;
            }else if (d1 > d2){
                return 1;
            }else{
                return 0;
            }
        });
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
    module.exports = BiasedBotBomberPlane;
}