// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    BiasedBotFighterPlane = require("./biased_bot_fighter_plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    calculateAngleDiffCWRAD = helperFunctions.calculateAngleDiffCWRAD;
    calculateAngleDiffCCWRAD = helperFunctions.calculateAngleDiffCCWRAD;
}
/*
    Class Name: BiasedCampaignAttackerBotFighterPlane
    Description: A bot fighter plane who is flying with a bomber to attack targets
*/
class BiasedCampaignAttackerBotFighterPlane extends BiasedBotFighterPlane {
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
        super(planeClass, gamemode, biases, autonomous);
        this.startingThrottle = this.throttle;
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep:
                A json representation of a Biased Campaign Attacker Bot Fighter Plane
            gamemode:
                A gamemode object
        Method Description: Creates a new Biased Campaign Attacker Bot Fighter Plane
        Method Return: BiasedCampaignAttackerBotFighterPlane
    */
    static fromJSON(rep, gamemode){
        let planeClass = rep["basic"]["plane_class"];
        let fp = new BiasedCampaignAttackerBotFighterPlane(planeClass, gamemode, rep["biases"], false);  // In all circumstances when loading a bot from a JSON it will not be autonomous
        fp.initFromJSON(rep)
        return fp;
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for the plane for the next tick
        Method Return: void
    */
    makeDecisions(){
        // Only make decisions if autonomous
        if (!this.isAutonomous()){ return; }

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

        // Always make sure throttle is at max if fighting 
        if (this.currentEnemy != null){
            this.decisions["throttle"] = 1;
        }

        // Check if decisions have been modified
        if (FighterPlane.areMovementDecisionsChanged(startingDecisions, this.decisions)){
            this.decisions["last_movement_mod_tick"] = this.getCurrentTicks();
        }
    }

    /*
        Method Name: initFromJSON
        Method Parameters:
            rep:
                A json representation of a fighter plane
        Method Description: Sets attributes of a fighter plane from a JSON representation
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
        this.startingThrottle = rep["basic"]["starting_throttle"];
        this.dead = rep["basic"]["dead"];
        this.decisions = rep["decisions"];
        this.shootLock.setTicksLeft(rep["locks"]["shoot_lock"]);
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the fighter plane
        Method Return: JSON Object
    */
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "shoot_lock": this.shootLock.getTicksLeft(),
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
            "starting_throttle": this.startingThrottle,
            "dead": this.isDead()
        }
        return rep;
    }

    /*
        Method Name: handleWhenNoEnemy
        Method Parameters: None
        Method Description: Determine what to do when there is no enemy
        Method Return: void
    */
    handleWhenNoEnemy(){
        this.cruiseByBomber();
    }

    /*
        Method Name: findMyBomber
        Method Parameters: None
        Method Description: Finds the furthest (highest x value) living bomber
        Method Return: Bomber
    */
    findMyBomber(){
        let furthestBomber = null;
        let planes = this.gamemode.getTeamCombatManager().getLivingPlanes();
        for (let plane of planes){
            if (!(plane instanceof BomberPlane) || plane.isDead()){ continue; }
            if (furthestBomber == null || plane.getX() > furthestBomber.getX()){
                furthestBomber = plane;
            }
        }
        // Bomber assumed not null because then gamemode is broken
        return furthestBomber;
    }

    /*
        Method Name: cruiseByBomber
        Method Parameters: None
        Method Description: Makes decisions to cruise near a bomber
        Method Return: void
    */
    cruiseByBomber(){
        let bomber = this.findMyBomber();
        // Incase bomber just died
        if (bomber == null){ return; }
        let xDistance = Math.abs(bomber.getX() - this.getX());
        let yDistance = Math.abs(bomber.getY() - this.getY());
        // If too far from bomber in x then go to bomber
        if (xDistance > PROGRAM_DATA["ai"]["fighter_plane"]["max_x_distance_from_bomber_cruising_campaign"] || yDistance > PROGRAM_DATA["ai"]["fighter_plane"]["max_y_distance_from_bomber_cruising_campaign"]){
            // Make sure that you are facing the right way
            if (bomber.isFacingRight() != this.isFacingRight()){
                this.decisions["face"] = this.isFacingRight() ? 1 : -1;
            }
            let angleToBomberRAD = this.angleToOtherRAD(bomber);
            let dCWRAD = calculateAngleDiffCWRAD(this.angle, angleToBomberRAD);
            let dCCWRAD = calculateAngleDiffCCWRAD(this.angle, angleToBomberRAD);
            if (dCWRAD < dCCWRAD){
                this.decisions["angle"] = -1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), dCWRAD);
            }else if (dCCWRAD < dCWRAD){
                this.decisions["angle"] = 1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), dCCWRAD);
            }
            // Make sure you're at top speed heading to the bomber!
            this.decisions["throttle"] = 1;
            return;
        }
        // Else close to the bomber

        // Face in the proper direction
        if (bomber.isFacingRight() != this.isFacingRight()){
            this.decisions["face"] = this.isFacingRight() ? -1 : 1;
            return;
        }

        // Adjust angle to match bomber's angle
        let bomberAngleRAD = bomber.getAngle();
        let dCWRAD = calculateAngleDiffCWRAD(this.angle, bomberAngleRAD);
        let dCCWRAD = calculateAngleDiffCCWRAD(this.angle, bomberAngleRAD);
        let angleDiffRAD = calculateAngleDiffRAD(this.angle, bomberAngleRAD);
        if (dCWRAD < dCCWRAD){
            this.decisions["angle"] = -1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), angleDiffRAD);
        }else if (dCCWRAD < dCWRAD){
            this.decisions["angle"] = 1 * Math.min(toFixedRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"] - this.biases["rotation_angle_debuff"]), angleDiffRAD);
        }
        // Speed up or slow down depending on bomber's speed
        let desiredThrottle = Math.floor(this.calculateThrottleToMatchSpeed(bomber.getSpeed() + PROGRAM_DATA["ai"]["fighter_plane"]["bomber_cruise_speed_following_offset"]));
        let requiredThrottle = this.calculateThrottleToRealisticallyMatchSpeed(desiredThrottle, bomber.getX(), bomber.getSpeed() + PROGRAM_DATA["ai"]["fighter_plane"]["bomber_cruise_speed_following_offset"]);
        if (this.throttle > requiredThrottle){
            this.decisions["throttle"] = -1;
        }else if (this.throttle < requiredThrottle){
            this.decisions["throttle"] = 1;
        }
    }

    /*
        Method Name: calculateThrottleToRealisticallyMatchSpeed
        Method Parameters:
            desiredThrottle:
                The throttle desired by the fighter plane to match the bomber's speed
            bomberX:
                The x location of the friendly bomber
            bomberSpeed:
                The speed of the friendly bomber
        Method Description: Determines what throttle this plane should use to match the speed of a bomber but taking into account more information than calculateThrottleToMatchSpeed
        Method Return: Number
    */
    calculateThrottleToRealisticallyMatchSpeed(desiredThrottle, bomberX, bomberSpeed){
        let displacementToBomber = bomberX - this.getX();
        // If fairly close to bomber then use the desired throttle
        if (Math.abs(displacementToBomber) < PROGRAM_DATA["ai"]["fighter_plane"]["max_x_distance_from_bomber_cruising_campaign"] / 8 || this.getSpeed() < bomberSpeed * 0.9){
            return desiredThrottle;
        }else if (displacementToBomber > 0){
            return desiredThrottle * 1.05;
        }else{
            return desiredThrottle * 0.15;
        }
    }

    /*
        Method Name: calculateThrottleToMatchSpeed
        Method Parameters:
            bomberSpeed:
                The speed of the friendly bomber
        Method Description: Determines what throttle this plane should use to match the speed of a bomber
        Method Return: Number
    */
    calculateThrottleToMatchSpeed(bomberSpeed){
        let dragAtBomberSpeed = Math.sqrt(Math.abs(bomberSpeed));
        return dragAtBomberSpeed / this.throttleConstant;
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
            if (distance > PROGRAM_DATA["ai"]["fighter_plane"]["max_enemy_distance_campaign"]){ continue; }
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
        Method Name: createBiasedPlane
        Method Parameters: 
            planeClass:
                A string representing the type of the plane
            gamemode:
                A gamemode objet related to the plane
            difficulty:
                The current difficulty setting
        Method Description: Return a new biased campaign attacker plane
        Method Return: BiasedCampaignAttackerBotFighterPlane
    */
    static createBiasedPlane(planeClass, gamemode, difficulty){
        let biases = BiasedBotFighterPlane.createBiases(difficulty);
        return new BiasedCampaignAttackerBotFighterPlane(planeClass, gamemode, biases);
    }
}
// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = BiasedCampaignAttackerBotFighterPlane;
}