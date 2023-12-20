MultiplayerRemoteFighterPlane = require("../scripts/multiplayer_remote_fighter_plane.js");
class MultiplayerServerRemoteFighterPlane extends MultiplayerRemoteFighterPlane {
    constructor(planeClass, scene, gameMode, rotationTime, speed, maxSpeed, throttleConstant, health, lastActions, angle, facingRight, clientID){
        super(planeClass, scene, gameMode, rotationTime, speed, maxSpeed, throttleConstant, health, lastActions, angle, facingRight;
    }

    tick(){
        let inputAtCurrentTick = gameMode.getInputAtCurrentTick(this.getID());
        let latestInput = gameMode.getLastInput(this.getID());
        if (latestInput != null){
            this.lastActions = latestInput;
        }
        super.tick();
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