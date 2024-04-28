// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    BiasedBotBomberPlane = require("./biased_bot_bomber_plane.js");
}

/*
    Class Name: BiasedCampaignBotBomberPlane
    Description: A subclass of the BiasedBomberBomberPlane with the task of bombing all buildings.
*/
class BiasedCampaignBotBomberPlane extends BiasedBotBomberPlane {
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
        this.flightAngle = 0;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.bombLock.tick();

        // Tick guns (just decreases the tick lock in this case)
        for (let gun of this.guns){
            gun.tick();
        }

        // Bomber Plane Tick Call
        super.tick();
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
        rep["locks"] = {
            "bomb_lock": this.bombLock.getTicksLeft(),
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

    /*
        Method Name: initFromJSON
        Method Parameters:
            rep:
                A json representation of a biased campaign bot bomber plane
        Method Description: Sets attributes of a biased campaign bot bomber plane from a JSON representation
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
        Method Name: fromJSON
        Method Parameters:
            rep:
                A json representation of a biased bot bomber plane
            gamemode:
                A gamemode object
            autonomous:
                Whether or not the new plane can make its own decisions (Boolean)
        Method Description: Creates a new Biased Campaign Bot Bomber Plane
        Method Return: BiasedCampaignBotBomberPlane
    */
    static fromJSON(rep, gamemode, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let bp = new BiasedCampaignBotBomberPlane(planeClass, gamemode, rep["biases"], autonomous);
        bp.initFromJSON(rep)
        return bp;
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for the plane for the next tick
        Method Return: void
    */
    makeDecisions(){
        // If not allowed to make decisions -> not make any
        if (!this.isAutonomous()){ return; }
        this.resetDecisions();

        // Decide if the plane must switch directions
        this.decideOnDirection();

        // Decide of whether or not to bomb
        this.checkIfBombing();

        // Let gun make decisions
        let enemyList = this.getEnemyList();
        for (let gun of this.guns){
            gun.makeDecisions(enemyList);
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
        this.decisions["bombing"] = false;
    }

    /*
        Method Name: executeAttackingDecisions
        Method Parameters: None
        Method Description: Decide whether or not to shoot
        Method Return: void
    */
    executeAttackingDecisions(){
        // Drop bombs
        if (this.decisions["bombing"]){
            if (this.bombLock.isReady()){
                this.dropBomb();
                this.bombLock.lock();
            }
        }

        // Let guns shoot
        for (let gun of this.guns){
            gun.executeDecisions();
        }
    }

    /*
        Method Name: decideOnDirection
        Method Parameters: None
        Method Description: Make a decision on which direction to face. Either stay the same or turn.
        Method Return: void
    */
    decideOnDirection(){
        let buildingInfo = this.getBuildingInfo();
        let bombXAirTravel = this.getBombXAirTravel();
        // If far past the last building then turn around
        if (this.x > buildingInfo["last_building"] + bombXAirTravel * PROGRAM_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"] && this.isFacingRight()){
            this.flightAngle = toRadians(180) + toRadians(1); // I want them flying downwards
            //console.log("turn left", this.x, this.bombXAirTravel() * PROGRAM_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"], buildingInfo); // TODO: Remove
        }
        // If far ahead of the first building and facing the wrong way then turn around
        else if (this.x < buildingInfo["first_building"] - bombXAirTravel * PROGRAM_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"] && !this.isFacingRight()){
            this.flightAngle = fixRadians(0 - toRadians(1)); // I want them flying downwards
            //console.log("turn right", this.x, this.bombXAirTravel() * PROGRAM_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"], buildingInfo); // TODO: Remove
        }
        this.turnInDirection(this.flightAngle);
        // If not fighting an enemy then roll over the plane if needed
        this.correctFacingDirection();
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
        Method Description: Return the max shooting distance of this biased plane
        Method Return: BiasedCampaignBotBomberPlane
    */
    static createBiasedPlane(planeClass, gamemode, difficulty){
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
        return new BiasedCampaignBotBomberPlane(planeClass, gamemode, biases); // Temporary values some will be changed
    }

    /*
        Method Name: getBuildingInfo
        Method Parameters: None
        Method Description: Determines the x location of the start of the first (lowest x) building and the end of the last (highest x) building
        Method Return: JSON Object
    */
    getBuildingInfo(){
        let frontEnd = null;
        let backEnd = null;
        for (let [building, bI] of this.gamemode.getTeamCombatManager().getBuildings()){
            if (building.isDead()){ continue; }
            let buildingFrontX = building.getCenterX() - building.getWidth()/2;
            let buildingBackX = building.getCenterX() + building.getWidth()/2;
            if (frontEnd == null || buildingFrontX < frontEnd){
                frontEnd = buildingFrontX;
            }
            if (backEnd == null || buildingBackX > backEnd){
                backEnd = buildingBackX;
            }
        }
        return {"first_building": frontEnd, "last_building": backEnd};
    }

    /*
        Method Name: checkIfBombing
        Method Parameters: None
        Method Description: Check if it makes sense to start bombing. If so -> start bombing.
        Method Return: void
    */
    checkIfBombing(){
        if (this.bombLock.notReady()){ return; }
        let bombHitX = this.getBombHitX();
        let buildingInfo = this.getBuildingInfo();
        // If the bomb hit location isn't near the buildings then don't drop a bomb
        //console.log(bombHitX, buildingInfo["last_building"] + PROGRAM_DATA["ai"]["bomber_plane"]["extra_bomb_distance"], buildingInfo["first_building"] - PROGRAM_DATA["ai"]["bomber_plane"]["extra_bomb_distance"])
        if (bombHitX > buildingInfo["last_building"] + PROGRAM_DATA["ai"]["bomber_plane"]["extra_bomb_distance"]){ return; }
        if (bombHitX < buildingInfo["first_building"] - PROGRAM_DATA["ai"]["bomber_plane"]["extra_bomb_distance"]){ return; }
        this.decisions["bombing"] = true;
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedCampaignBotBomberPlane;
}