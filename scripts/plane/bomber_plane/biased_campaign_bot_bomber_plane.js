// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    BomberPlane = require("./bomber_plane.js");
    var helperFunctions = require("../../general/helper_functions.js");
    angleBetweenCCWDEG = helperFunctions.angleBetweenCCWDEG;
}

/*
    Class Name: BiasedCampaignBotBomberPlane
    Description: A subclass of the BomberPlane with biases for its actions and the task at bombing all buildings.
    Note: Lots of this code should be copied from BiasedBotBomberPlane. It's unfortunate but this can't be a subclass so its mostly a copy.
*/
class BiasedCampaignBotBomberPlane extends BomberPlane {
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
        super(planeClass, scene, angle, facingRight);
        this.biases = biases;
        this.generateGuns(biases);
        this.throttle += this.biases["throttle"];
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.startingHealth = this.health;
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
        this.bombLock.tick();
        for (let gun of this.guns){
            gun.tick();
        }

        // Bomber Plane Tick Call
        super.tick(timeDiffMS);
    }

    // TODO: Comments
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

    // TODO: Comments
    fromJSON(rep){
        let takePosition = !this.autonomous && rep["movement_mod_count"] > this.movementModCount;
        // If this is local and the plane owned by the user then don't take decisions from server
        if (this.autonomous && this.isLocal()){
            this.health = rep["basic"]["health"];
            this.dead = rep["basic"]["dead"];
            this.bombLock.setTicksLeft(rep["locks"]["bomb_lock"]);  
            for (let i = 0; i < this.guns.length; i++){
                this.guns[i].fromJSON(rep["guns"][i]);
            }
        }else if (!this.autonomous && !this.isLocal()){ // If server then take decisions from local
            this.decisions = rep["decisions"];
            for (let i = 0; i < this.guns.length; i++){
                this.guns[i].fromJSON(rep["guns"][i]);
            }
        }else{ // This is running in a browser but the user does not control this plane
            this.health = rep["basic"]["health"];
            this.dead = rep["basic"]["dead"];
            this.bombLock.setTicksLeft(rep["locks"]["bomb_lock"]);  
            this.decisions = rep["decisions"];
            for (let i = 0; i < this.guns.length; i++){
                this.guns[i].fromJSON(rep["guns"][i]);
            }
        }

        // If this is not the one controlling the plane and the local inputs are out of date
        if (takePosition){
            this.x = rep["basic"]["x"];
            this.y = rep["basic"]["y"];
            this.facingRight = rep["basic"]["facing_right"];
            this.angle = rep["basic"]["angle"];
            this.throttle = rep["basic"]["throttle"];
            this.speed = rep["basic"]["speed"];
            // Approximate plane positions in current tick based on position in server tick
            if (tickDifference > 0){
                this.rollForward(tickDifference);
            }else if (tickDifference < 0){
                this.rollBackward(tickDifference);
            }
        }
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

    // TODO: Comments
    static fromJSON(rep, scene, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let bp = new BiasedCampaignBotBomberPlane(planeClass, scene, rep["angle"], rep["facing_right"], rep["biases"], autonomous);
        bp.initFromJSON(rep)
        return bp;
    }

    // TODO: Comments
    makeDecisions(){
        // If not allowed to make decisions -> not make any
        if (!this.autonomous){ return; }
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

    // TODO: Comments
    resetDecisions(){
        this.decisions["face"] = 0;
        this.decisions["angle"] = 0;
        this.decisions["bombing"] = false;
    }

    // TODO: Comments
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
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return PROGRAM_DATA["settings"]["shoot_distance_constant"] * PROGRAM_DATA["bullet_data"]["speed"] + this.biases["max_shooting_distance_offset"];
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
            scene:
                A scene objet related to the plane
            difficulty:
                The current difficulty setting
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    static createBiasedPlane(planeClass, scene, difficulty){
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
        return new BiasedCampaignBotBomberPlane(planeClass, scene, true, 0, biases); // Temporary values some will be changed
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
        for (let [building, bI] of this.scene.getTeamCombatManager().getBuildings()){
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