// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    BomberPlane = require("./bomber_plane.js");
    HumanBomberTurret = require("../../turret/human_bomber_turret.js");
    helperFunctions = require("../../general/helper_functions.js");
    calculateAngleDiffDEGCCW = helperFunctions.calculateAngleDiffDEGCCW;
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
            game:
                A Scene object related to the bomber plane
            angle:
                The starting angle of the bomber plane (integer)
            facingRight:
                The starting orientation of the bomber plane (boolean)
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, game, angle=0, facingRight=true, autonomous=true){
        super(planeClass, game, angle, facingRight);
        this.lrLock = new Lock();
        this.radarLock = new TickLock(1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.radar = new PlaneRadar(this);
        this.bombLock = new TickLock(1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.generateGuns();
        this.autonomous = autonomous;
    }

    /*
        Method Name: setAutonomous
        Method Parameters: None
        Method Description: Setter
        Method Return: void
    */
    setAutonomous(value){
        this.autonomous = value;
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
        if (this.autonomous){ return; }
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
            this.guns[i].fromJSON(rep["guns"][i]);
        }
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep:
                A json representation of a human bomber plane
            game:
                A game object
            autonomous:
                Whether or not the new plane can make its own decisions (Boolean)
        Method Description: Creates a new Human Bomber Plane
        Method Return: HumanBomberPlane
    */
    static fromJSON(rep, game, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let hBP = new HumanBomberPlane(planeClass, game, rep["angle"], rep["facing_right"], autonomous);
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
            this.guns.push(HumanBomberTurret.create(gunObj, this.game, this, this.autonomous));
        }
    }

    /*
        Method Name: die
        Method Parameters: None
        Method Description: Kill off a plane and replace it with a spectator plane
        Method Return: void
    */
    die(){
        super.die();
        let cam = new SpectatorCamera(this.game, this.x, this.y);
        this.game.addEntity(cam);
        this.game.setFocusedEntity(cam);
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
        Method Parameters:
            timeDiffMS:
                The time between ticks
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(timeDiffMS){
        this.radarLock.tick();
        this.bombLock.tick();
        for (let gun of this.guns){
            gun.tick();
        }
        //console.log(this.isFacingRight(), this.angle)
        this.updateRadar();
        super.tick(timeDiffMS);
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
        this.resetDecisions();
        this.checkMoveLeftRight();
        this.checkUpDown();
        this.checkThrottle();
        this.checkBomb();

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

        // Adjust angle
        if (this.decisions["angle"] != 0){
            this.adjustAngle(this.decisions["angle"]);
        }

        // Increase / decrease throttle
        if (this.decisions["throttle"] != 0){
            this.adjustThrottle(this.decisions["throttle"]);
        }

        // Drop bombs
        if (this.decisions["bombing"]){
            if (this.bombLock.isReady()){
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
        Method Name: updateRadar
        Method Parameters: None
        Method Description: Update the radar with new information
        Method Return: void
    */
    updateRadar(){
        if (this.radarLock.isReady()){
            this.radar.update();
            this.radarLock.lock();
        }
    }

    /*
        Method Name: checkMoveLeftRight
        Method Parameters: None
        Method Description: Check if the user wishes to switch direction
        Method Return: void
    */
    checkMoveLeftRight(){
        let aKey = keyIsDown(65);
        let dKey = keyIsDown(68);
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
        let wKeyCount = Math.floor(USER_INPUT_MANAGER.getTickedAggregator("w").getPressTime() / PROGRAM_DATA["controls"]["angle_change_ms"]);
        let sKeyCount = Math.floor(USER_INPUT_MANAGER.getTickedAggregator("s").getPressTime() / PROGRAM_DATA["controls"]["angle_change_ms"]);
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
            this.decisions["angle"] = -1 * Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], wKeyCount);
        }else if (sKeyCount > 0){
            this.decisions["angle"] = Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"], sKeyCount);
        }
    }

    /*
        Method Name: checkBomb
        Method Parameters: None
        Method Description: Check if the user wishes to drop a bomb
        Method Return: void
    */
    checkBomb(){
        let spaceKey = keyIsDown(32);
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
        let rKey = keyIsDown(82);
        let fKey = keyIsDown(70);
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
