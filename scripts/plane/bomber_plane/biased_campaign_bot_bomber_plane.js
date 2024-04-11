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
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.bombLock.tick();
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
        Method Name: executeDecisions
        Method Parameters: None
        Method Description: Take actions based on saved decisions
        Method Return: void
    */
    executeDecisions(){
        // Change facing direction
        if (this.decisions["face"] != 0){
            this.face(this.decisions["face"] == 1 ? true : false);
        }

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
        // If far past the last building then turn around
        if (this.x > buildingInfo["last_building"] + this.bombXAirTravel() * PROGRAM_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"] && this.isFacingRight()){
            this.decisions["face"] = -1;
        }
        // If far ahead of the first building and facing the wrong way then turn around
        else if (this.x < buildingInfo["first_building"] - this.bombXAirTravel() * PROGRAM_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"] && !this.isFacingRight()){
            this.decisions["face"] = 1;
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
            if (frontEnd == null || building.getX() < frontEnd){
                frontEnd = building.getX();
            }
            if (backEnd == null || building.getX() + building.getWidth() > backEnd){
                backEnd = building.getX() + building.getWidth();
            }
        }
        return {"first_building": frontEnd, "last_building": backEnd};
    }

    /*
        Method Name: bombXAirTravel
        Method Parameters: None
        Method Description: Calculate how far the bomb will travel (in x) while falling
        Method Return: float
    */
    bombXAirTravel(){
        // If the plane is at/below ground don't bother with computation
        if (this.y <= 0){ return 0; }
        // Calculate time to hit ground
        /*
            d = vI * t + 1/2 * g * t^2
            d = 0.5g * t^2 + vI * t + 0
            0 = 0.5g * t^2 + vI * t - d
            t = [-1 * vI + sqrt(vI + 2 * g * d)] / g
        */
        let vI = this.bombInitialYVelocity();
        let g = PROGRAM_DATA["constants"]["gravity"];
        let d = this.y;
        // Note: There may be some error here because I wasn't thinking too clearly when I was setting up the equation and considering the direction of the initial velocity
        let time = (vI + Math.sqrt(Math.pow(vI, 2) + 2 * d * g)) / g;
        // Calculate x distance covered in that time
        return Math.abs(this.getXVelocity() * time);
    }

    /*
        Method Name: bombInitialYVelocity
        Method Parameters: None
        Method Description: Calculate the the initial y velocity of the bomb
        Method Return: float
    */
    bombInitialYVelocity(){
        return this.getYVelocity() + PROGRAM_DATA["bomb_data"]["initial_y_velocity"]; 
    }

    /*
        Method Name: checkIfBombing
        Method Parameters: None
        Method Description: Check if it makes sense to start bombing. If so -> start bombing.
        Method Return: void
    */
    checkIfBombing(){
        if (this.bombLock.notReady()){ return; }
        let distanceTravelledByBomb = this.bombXAirTravel();
        let bombHitX = this.x + distanceTravelledByBomb * (this.isFacingRight() ? 1 : -1);
        let buildingInfo = this.getBuildingInfo();
        // If the bomb hit location isn't near the buildings then don't drop a bomb
        if (!(bombHitX >= buildingInfo["first_building"] && bombHitX <= buildingInfo["last_building"])){ return; }
        this.decisions["bombing"] = true;
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedCampaignBotBomberPlane;
}