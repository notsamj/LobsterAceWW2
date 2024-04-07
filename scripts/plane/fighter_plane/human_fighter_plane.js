// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    TickLock = require("../../general/tick_lock.js");
    FighterPlane = require("./fighter_plane.js");
    PlaneRadar = require("../../radar/plane_radar.js");
    CooldownLock = require("../../general/cooldown_lock.js");
    copyObject = helperFunctions.copyObject;
}
/*
    Class Name: HumanFighterPlane
    Description: A fighter plane operated by a human
*/
class HumanFighterPlane extends FighterPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            game:
                A game object related to the fighter plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
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
        Method Description: Creates a JSON representation of the human fighter plane
        Method Return: JSON Object
    */
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["locks"] = {
            "shoot_lock": this.shootLock.getTicksLeft()
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
            "dead": this.isDead(),
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
                A json representation of a plane
        Method Description: Sets attributes of a plane from a JSON representation
        Method Return: void
    */
    initFromJSON(rep){
        this.id = rep["basic"]["id"];
        this.health = rep["basic"]["health"];
        this.dead = rep["basic"]["dead"];
        this.shootLock.setTicksLeft(rep["locks"]["shoot_lock"]);
        this.x = rep["basic"]["x"];
        this.y = rep["basic"]["y"];
        this.facingRight = rep["basic"]["facing_right"];
        this.angle = rep["basic"]["angle"];
        this.throttle = rep["basic"]["throttle"];
        this.speed = rep["basic"]["speed"];
        this.health = rep["basic"]["health"];
        this.startingHealth = rep["basic"]["starting_health"];
        this.decisions = rep["decisions"];
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep:
                A json representation of a human fighter plane
            game:
                A game object
            autonomous:
                Whether or not the new plane can make its own decisions (Boolean)
        Method Description: Creates a new Human Fighter Plane
        Method Return: HumanFighterPlane
    */
    static fromJSON(rep, game, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let hFP = new HumanFighterPlane(planeClass, game, rep["angle"], rep["facing_right"], autonomous);
        hFP.initFromJSON(rep);
        return hFP;
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
        // Only need radar if autonomous
        if (this.autonomous){ this.radarLock.tick(); this.updateRadar(); }
        super.tick(timeDiffMS);
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for the plane for the next tick
        Method Return: void
    */
    makeDecisions(){
        // Sometimes the human will be controlled by the external input so don't make decisions
        if (!this.autonomous || !GAMEMODE_MANAGER.getActiveGamemode().inputAllowed()){
            return;
        }
        let startingDecisions = copyObject(this.decisions);
        this.resetDecisions();
        this.checkMoveLeftRight();
        this.checkUpDown();
        this.checkShoot();
        this.checkThrottle();
        // Check if decisions have been modified
        if (FighterPlane.areMovementDecisionsChanged(startingDecisions, this.decisions)){
            this.decisions["last_movement_mod_tick"] = this.getCurrentTicks();
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
            this.decisions["angle"] = -1 * Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"], wKeyCount);
        }else if (sKeyCount > 0){
            this.decisions["angle"] = Math.min(PROGRAM_DATA["controls"]["max_angle_change_per_tick_fighter_plane"], sKeyCount);
        }
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

    /*
        Method Name: checkShoot
        Method Parameters: None
        Method Description: Check if the user wishes to shoot
        Method Return: void
    */
    checkShoot(){
        let spaceKey = keyIsDown(32);
        if (!this.shootLock.isReady() || !spaceKey){
            return;
        }
        this.decisions["shoot"] = true;
    }
}
// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = HumanFighterPlane;
}