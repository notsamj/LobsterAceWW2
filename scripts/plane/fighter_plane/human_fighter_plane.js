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
            scene:
                A Scene object related to the fighter plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle=0, facingRight=true, autonomous=true){
        super(planeClass, scene, angle, facingRight);
        this.lrLock = new Lock();
        this.radarLock = new TickLock(1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.radar = new PlaneRadar(this);
        this.autonomous = autonomous;
    }

    // TODO: Comments
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
            "dead": this.isDead()
        }
        return rep;
    }

    // TODO: Comments
    fromJSON(rep){
        // If running locally only take a few attributes
        if (this.autonomous){
            this.id = rep["basic"]["id"];
            this.health = rep["basic"]["health"];
            this.dead = rep["basic"]["dead"];
            this.shootLock.setTicksLeft(rep["locks"]["shoot_lock"]);
        }else{ // Otherwise take everything else
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
    }

    // TODO: Comments
    static fromJSON(rep, scene, autonomous){
        let planeClass = rep["basic"]["plane_class"];
        let hFP = new HumanFighterPlane(planeClass, scene, rep["angle"], rep["facing_right"], autonomous);
        // For the first time even if autonomous need to set x
        // TODO: DO this for other things maybe just human bomber
        hFP.setX(rep["basic"]["x"]);
        hFP.setY(rep["basic"]["y"])
        hFP.fromJSON(rep)
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
        this.radarLock.tick();
        this.updateRadar();
        super.tick(timeDiffMS);
    }

    // TODO: Comments
    resetDecisions(){
        this.decisions["face"] = 0;
        this.decisions["angle"] = 0;
        this.decisions["shoot"] = false;
        this.decisions["throttle"] = 0;
    }

    // TODO: Comments
    makeDecisions(){
        // Sometimes the human will be controlled by the external input so don't make decisions
        if (!this.autonomous){
            return;
        }
        this.resetDecisions();
        this.checkMoveLeftRight();
        this.checkUpDown();
        this.checkShoot();
        this.checkThrottle();
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
        let wKey = keyIsDown(87);
        let sKey = keyIsDown(83);
        let numKeysDown = 0;
        numKeysDown += wKey ? 1 : 0;
        numKeysDown += sKey ? 1 : 0;

        // Only ready to switch direction again once you've stopped holding for at least 1 cd
        if (numKeysDown === 0){
            return;
        }else if (numKeysDown > 1){ // Can't which while holding > 1 key
            return;
        }
        if (wKey){
            this.decisions["angle"] = -1;
        }else if (sKey){
            this.decisions["angle"] = 1;
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