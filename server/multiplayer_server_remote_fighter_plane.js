MultiplayerRemoteFighterPlane = require("../scripts/multiplayer_remote_fighter_plane.js");
fileData = require("../data/data_json.js");
class MultiplayerServerRemoteFighterPlane extends MultiplayerRemoteFighterPlane {
    constructor(planeClass, scene, gameMode){
        //console.log(fileData["plane_data"][planeClass], planeClass, planeClass, scene, gameMode, 0, fileData["plane_data"][planeClass]["health"])
        super(planeClass, scene, gameMode, 0, fileData["plane_data"][planeClass]["max_speed"], fileData["plane_data"][planeClass]["max_speed"], Math.sqrt(fileData["plane_data"][planeClass]["max_speed"]) / fileData["constants"]["MAX_THROTTLE"], fileData["plane_data"][planeClass]["health"], { "face": true, "turn": 0, "shooting": false, "throttle": 0}, 0, true);
        this.x = 50000;
        this.y = 50000;
    }

    async tick(timeMS){
        let savedInput = await this.gameMode.getLastInputUpToCurrentTick(this.getID());
        if (savedInput != null){
            this.lastActions = savedInput;
        }
        super.tick(timeMS);
    }

    update(newStats){
        // TODO This is a useless function
        console.error("BADBADBADSTOP");
        this.x = newStats["x"];
        this.y = newStats["y"];
        this.facingRight = newStats["facing"];
        this.angle = newStats["angle"];
        this.speed = newStats["speed"];
        this.throttle = newStats["throttle"];
        this.health = newStats["health"];
        this.lastActions = newStats["lastActions"];
    }

    getState(){
        // console.log("Speed", this.speed)
        return {
            "plane_class": this.getPlaneClass(),
            "id": this.getID(),
            "isDead": this.isDead(),
            "x": this.getX(),
            "y": this.getY(),
            "facing": this.isFacingRight(),
            "angle": this.angle,
            "throttle": this.throttle,
            "speed": this.speed,
            "max_speed": this.maxSpeed,
            "throttle_constant": this.throttleConstant,
            "health": this.health,
            "lastActions": this.lastActions
        }
    }
}
module.exports=MultiplayerServerRemoteFighterPlane;