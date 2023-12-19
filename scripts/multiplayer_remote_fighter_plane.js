class MultiplayerRemoteFighterPlane extends FighterPlane{
    constructor(planeClass, scene, gameMode, rotationTime, speed, maxSpeed, throttleConstant, health, lastActions, angle, facingRight){
        super(planeClass, scene, angle, facingRight);
        this.maxSpeed = maxSpeed;
        this.speed = speed;
        this.throttleConstant = throttleConstant;
        this.rotationCD = new CooldownLock(rotationTime);
        this.health = health;
        this.lastActions = lastActions;
        this.gameMode = gameMode;
    }

    update(newStats){
        //this.rotationCD.unlock();
        //this.shootLock.unlock();
        this.dead = newStats["isDead"];
        this.x = newStats["x"];
        this.y = newStats["y"];
        this.facingRight = newStats["facing"];
        this.angle = newStats["angle"];
        this.speed = newStats["speed"];
        this.throttle = newStats["throttle"];
        this.health = newStats["health"];
        this.lastActions = newStats["lastActions"];
    }

    adjustByActions(actions){
        if (actions["shooting"] && this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
        this.adjustAngle(actions["turn"]);
        if (this.facingRight != actions["face"]){
            this.face(actions["face"]);
        }
    }

    tick(timeMS){
        let actions = this.lastActions;
        this.adjustByActions(actions);
        super.tick(timeMS);
    }
}