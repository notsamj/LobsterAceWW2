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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(planeClass, scene, angle, facingRight);
        this.lrLock = new Lock();
        this.radarLock = new TickLock(1000 / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.radar = new PlaneRadar(this);
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
        this.radarLock.tick();
        this.checkMoveLeftRight();
        this.checkUpDown();
        this.checkShoot();
        this.checkThrottle();
        this.updateRadar();
        super.tick(timeDiffMS);
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
            this.face(false);
        }else if (dKey){
            this.face(true);
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
            this.adjustAngle(-1);
        }else if (sKey){
            this.adjustAngle(1);
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
            this.adjustThrottle(1);
        }else if (fKey){
            this.adjustThrottle(-1);
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
        this.shootLock.lock();
        this.shoot();
    }
}