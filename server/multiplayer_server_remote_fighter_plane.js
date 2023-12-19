MultiplayerRemoteFighterPlane = require("../scripts/multiplayer_remote_fighter_plane.js");
class MultiplayerServerRemoteFighterPlane extends MultiplayerRemoteFighterPlane {
    constructor(planeClass, scene, gameMode, rotationTime, speed, maxSpeed, throttleConstant, health, lastActions, angle, facingRight){
        super(planeClass, scene, gameMode, rotationTime, speed, maxSpeed, throttleConstant, health, lastActions, angle, facingRight);
    }

    update(newStats){
        this.x = newStats["x"];
        this.y = newStats["y"];
        this.facingRight = newStats["facing"];
        this.angle = newStats["angle"];
        this.speed = newStats["speed"];
        this.throttle = newStats["throttle"];
        this.health = newStats["health"];
        this.lastActions = newStats["lastActions"];
    }
}
module.exports=MultiplayerServerRemoteFighterPlane;