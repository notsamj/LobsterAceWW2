// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    BomberPlane = require("./bomber_plane.js");
    HumanBomberTurret = require("../../turret/human_bomber_turret.js");
    helperFunctions = require("../../general/helper_functions.js");
}
/*
    Class Name: HumanBomberPlane
    Description: A bomber plane operated by a human
*/
class HumanBomberPlane extends BomberPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            gamemode:
                A Scene object related to the bomber plane
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, autonomous=true){
        super(planeClass, gamemode, autonomous);
        this.lrLock = new Lock();
        this.radar = new BomberPlaneRadar(this, 1000 / PROGRAM_DATA["settings"]["ms_between_ticks"], autonomous);
        this.bombLock = new TickLock(1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.generateGuns();
    }

    /*
        Method Name: applyDamageMultiplier
        Method Parameters:
            multiplier:
                A multiplier value
        Method Description: Modifies the damage of the bullets of the human bomber plane
        Method Return: void
    */
    applyDamageMultiplier(multiplier){
        for (let gun of this.guns){
            gun.applyDamageMultiplier(multiplier);
        }
    }

    /*
        Method Name: applyHealthMultiplier
        Method Parameters:
            multiplier:
                A multiplier value
        Method Description: Modifies the health of the human plane
        Method Return: void
    */
    applyHealthMultiplier(multiplier){
        this.setStartingHealth(this.getStartingHealth() * multiplier);
        this.setHealth(this.getStartingHealth());
    }

    /*
        Method Name: setAutonomous
        Method Parameters:
            value:
                Boolean, whether or not plane is autonomous
        Method Description: Setter
        Method Return: void
    */
    setAutonomous(value){
        super.setAutonomous(value);
        this.radar.setEnabled(value);
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the human bomber plane
        Method Return: JSON Object
    */
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "bomb_lock": this.bombLock.getTicksLeft(),
        } 
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
        Method Name: loadMovementIfNew
        Method Parameters:
            rep:
                A json representation of the plane
            rollForwardAmount:
                The number of ticks behind that this information is
        Method Description: Loads the movement information about the plane if the source has a newer set of values
        Method Return: void
    */
    loadMovementIfNew(rep, rollForwardAmount=0){
        if (this.isAutonomous()){ return; }
        super.loadMovementIfNew(rep, rollForwardAmount);
    }

    /*
        Method Name: initFromJSON
        Method Parameters:
            rep:
                A json representation of a human bomber plane
        Method Description: Sets attributes of a human bomber plane from a JSON representation
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
                A json representation of a human bomber plane
            gamemode:
                A gamemode object
            autonomous:
                Whether or not the new plane can make its own decisions (Boolean)
        Method Description: Creates a new Human Bomber Plane
        Method Return: HumanBomberPlane
    */
    static fromJSON(rep, gamemode, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let hBP = new HumanBomberPlane(planeClass, gamemode, autonomous);
        hBP.initFromJSON(rep)
        return hBP;
    }

    /*
        Method Name: isHuman
        Method Parameters: None
        Method Description: Determines whether the entity is controlled by a human.
        Method Return: boolean, true -> is controlled by a human, false -> is not controlled by a human
    */
    isHuman(){
        return true;
    }

    /*
        Method Name: generateGuns
        Method Parameters: None
        Method Description: Create gun objects for the plane
        Method Return: void
    */
    generateGuns(){
        this.guns = [];
        for (let gunObj of PROGRAM_DATA["plane_data"][this.planeClass]["guns"]){
            this.guns.push(HumanBomberTurret.create(gunObj, this));
        }
    }

    /*
        Method Name: getRadar
        Method Parameters: None
        Method Description: Getter
        Method Return: Radar
    */
    getRadar(){
        return this.radar;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.radar.tick();
        this.bombLock.tick();
        // Tick guns just does the shoot lock stuff
        for (let gun of this.guns){
            gun.tick();
        }
        super.tick();
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for the plane for the next tick
        Method Return: void
    */
    makeDecisions(){
        // Do not make decisions if not autonomous
        if (!this.autonomous){ return; }
        let startingDecisions = copyObject(this.decisions);
        this.resetDecisions();
        this.checkMoveLeftRight();
        this.checkUpDown();
        this.checkThrottle();
        this.checkBomb();
        // Make gun decisions
        for (let gun of this.guns){
            gun.makeDecisions();
        }
        // Check if decisions have been modified
        if (FighterPlane.areMovementDecisionsChanged(startingDecisions, this.decisions)){
            this.decisions["last_movement_mod_tick"] = this.getCurrentTicks();
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
        this.decisions["throttle"] = 0;
    }

    /*
        Method Name: executeMainDecisions
        Method Parameters: None
        Method Description: Take actions based on saved decisions
        Method Return: void
    */
    executeMainDecisions(){
        // Change facing direction
        if (this.decisions["face"] != 0){
            this.face(this.decisions["face"] == 1 ? true : false);
        }

        // Adjust angle
        if (this.decisions["angle"] != 0){
            this.adjustAngle(this.decisions["angle"]);
        }

        // Increase / decrease throttle
        if (this.decisions["throttle"] != 0){
            this.adjustThrottle(this.decisions["throttle"]);
        }
    }

    /*
        Method Name: executeAttackingDecisions
        Method Parameters: None
        Method Description: Decide whether or not to shoot and bomb
        Method Return: void
    */
    executeAttackingDecisions(){
        // Drop bombs
        if (this.decisions["bombing"]){
            if (this.bombLock.isReady() && this.gamemode.runsLocally()){
                this.bombLock.lock();
                this.dropBomb();
            }
        }

        // Let the guns make decisions
        for (let gun of this.guns){
            gun.executeDecisions();
        }
    }

    /*
        Method Name: hasRadar
        Method Parameters: None
        Method Description: Provide the information that HumanFighterPlanes do have radars
        Method Return: void
    */
    hasRadar(){ return true; }

    /*
        Method Name: checkMoveLeftRight
        Method Parameters: None
        Method Description: Check if the user wishes to switch direction
        Method Return: void
    */
    checkMoveLeftRight(){
        let aKey = USER_INPUT_MANAGER.isActivated("plane_turn_left");
        let dKey = USER_INPUT_MANAGER.isActivated("plane_turn_right");
        let numKeysDown = 0;
        numKeysDown += aKey ? 1 : 0;
        numKeysDown += dKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            if (!this.lrLock.isReady()){
                this.lrLock.unlock();
            }
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (!this.lrLock.isReady()){ return; }
        this.lrLock.lock();
        if (aKey){
            this.decisions["face"] = -1;
        }else if (dKey){
            this.decisions["face"] = 1;
        }
    }

    /*
        Method Name: checkUpDown
        Method Parameters: None
        Method Description: Check if the user wishes to change the angle of the plane
        Method Return: void
    */
    checkUpDown(){
        let angleChangeMS = (1000 / (PROGRAM_DATA["settings"]["tick_rate"] * PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"]));
        let wKeyCount = USER_INPUT_MANAGER.getTickedAggregator("w").getPressTime() / angleChangeMS;
        let sKeyCount = USER_INPUT_MANAGER.getTickedAggregator("s").getPressTime() / angleChangeMS;
        let numKeysDown = 0;
        numKeysDown += wKeyCount > 0 ? 1 : 0;
        numKeysDown += sKeyCount > 0 ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (wKeyCount > 0){
            this.decisions["angle"] = -1 * toRadians(Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], wKeyCount));
        }else if (sKeyCount > 0){
            this.decisions["angle"] = toRadians(Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], sKeyCount));
        }
    }

    /*
        Method Name: checkBomb
        Method Parameters: None
        Method Description: Check if the user wishes to drop a bomb
        Method Return: void
    */
    checkBomb(){
        let spaceKey = USER_INPUT_MANAGER.isActivated("fighter_plane_shooting");
        if (!this.bombLock.isReady() || !spaceKey){
            return;
        }
        this.decisions["bombing"] = true;
    }

    /*
        Method Name: checkThrottle
        Method Parameters: None
        Method Description: Check if the user wishes to increase or reduce throttle
        Method Return: void
    */
    checkThrottle(){
        let rKey = USER_INPUT_MANAGER.isActivated("plane_throttle_up");
        let fKey = USER_INPUT_MANAGER.isActivated("plane_throttle_down");
        let numKeysDown = 0;
        numKeysDown += rKey ? 1 : 0;
        numKeysDown += fKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (rKey){
            this.decisions["throttle"] = 1;
        }else if (fKey){
            this.decisions["throttle"] = -1;
        }
    }
}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = HumanBomberPlane;
}
