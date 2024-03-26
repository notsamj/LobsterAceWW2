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
            scene:
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
    constructor(planeClass, scene, angle=0, facingRight=true, autonomous=true){
        super(planeClass, scene, angle, facingRight);
        this.udLock = new TickLock(40 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.lrLock = new Lock();
        this.radarLock = new TickLock(1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.radar = new PlaneRadar(this);
        this.bombLock = new TickLock(1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.generateGuns();
        this.autonomous = autonomous;
    }

    // TODO: Comments
    setAutonomous(value){
        this.autonomous = value;
    }

    // TODO: Comments
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "bomb_lock": this.bombLock.getTicksLeft(),
            "ud_lock": this.udLock.getTicksLeft()
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
            this.udLock.setTicksLeft(rep["locks"]["ud_lock"]);
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
        let hBP = new HumanBomberPlane(planeClass, scene, rep["angle"], rep["facing_right"], autonomous);
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
            this.guns.push(HumanBomberTurret.create(gunObj, this.scene, this, this.autonomous));
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
        let cam = new SpectatorCamera(this.scene, this.x, this.y);
        this.scene.addEntity(cam);
        this.scene.setFocusedEntity(cam);
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
        this.udLock.tick();
        this.radarLock.tick();
        this.bombLock.tick();
        for (let gun of this.guns){
            gun.tick();
        }
        this.updateRadar();
        super.tick(timeDiffMS);
    }

    // TODO: Comments
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
    }

    // TODO: Comments
    resetDecisions(){
        this.decisions["face"] = 0;
        this.decisions["angle"] = 0;
        this.decisions["bombing"] = false;
        this.decisions["throttle"] = 0;
    }

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
        let wKeyCount = USER_INPUT_MANAGER.getTickedAggregator("w").clear();
        let sKeyCount = USER_INPUT_MANAGER.getTickedAggregator("s").clear();
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
