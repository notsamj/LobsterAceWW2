class MultiplayerRemoteFighterPlane extends FighterPlane{
    constructor(planeClass, scene, rotationTime, speed, maxSpeed, throttleConstant, health, lastActions, angle, facingRight){
        super(planeClass, scene, angle, facingRight);
        this.maxSpeed = maxSpeed;
        this.speed = speed;
        this.throttleConstant = throttleConstant;
        this.rotationCD = new CooldownLock(rotationTime);
        this.health = health;
        this.lastActions = lastActions;
    }

    updateStats(newStats){
        this.rotationCD.unlock();
        this.shootLock.unlock();
        this.x = newStats["x"];
        this.y = newStats["y"];
        this.facing = newStats["facing"];
        this.angle = newStats["angle"];
        this.speed = newStats["speed"];
        this.throttle = newStats["throttle"];
        this.health = newStats["health"];
        this.lastActions = newStats["lastActions"];
    }

    adjustByLastActions(){
        if (this.lastActions["shooting"] && this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
        this.adjustAngle(this.lastActions["turn"]);
        // TODO: Remove lastActions facing
    }

    tick(timeMS){
        this.adjustByLastActions();
        super.tick(timeMS);
    }
}