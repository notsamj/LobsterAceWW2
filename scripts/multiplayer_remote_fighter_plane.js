if (typeof window === "undefined"){
    FighterPlane = require("../scripts/fighter_plane.js");
}
class MultiplayerRemoteFighterPlane extends FighterPlane {
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

    setGameMode(gameMode){
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

    adjustByLastActions(){
        if (this.lastActions["shooting"] && this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
        this.adjustAngle(this.lastActions["turn"]);
        if (this.facingRight != this.lastActions["face"]){
            this.face(this.lastActions["face"])
        }
        this.throttle += this.lastActions["throttle"];
    }

    tick(timeMS){
        this.adjustByLastActions();
        super.tick(timeMS);
    }
}
if (typeof window === "undefined"){
    module.exports=MultiplayerRemoteFighterPlane;
}