if (typeof window === "undefined"){
    GameMode = require("../scripts/game_mode.js");
    FighterPlane = require("../scripts/fighter_plane.js");
    SceneTickManager = require("../scripts/scene_tick_manager.js");
    var planeModelToAlliance = require("../scripts/helper_functions.js").planeModelToAlliance;
    fileData = require("../data/data_json.js");
}
class Dogfight extends GameMode {
    constructor(startingEntities, scene){
        super();
        this.scene = scene;
        this.startingEntities = startingEntities;
        this.running = true;
        this.winner = null;
        this.isATestSession = this.isThisATestSession();
        this.tickManager = new SceneTickManager(Date.now(), this.scene, fileData["constants"]["MS_BETWEEN_TICKS"]);
    }

    getTickManager(){
        return this.tickManager;
    }

    isRunning(){
        return this.running;
    }

    tick(){
        if (!this.isRunning()){
            return;
        }
        this.tickManager.tick();
        this.checkForEnd();
    }

    checkForEnd(){
        let allyCount = 0;
        let axisCount = 0;
        for (let entity of this.startingEntities){
            if (entity instanceof FighterPlane && entity.getHealth() > 0){
                let fighterPlane = entity;
                if (planeModelToAlliance(fighterPlane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        // Check if the game is over
        if ((axisCount == 0 || allyCount == 0) && !this.isATestSession){
            this.winner = axisCount != 0 ? "Axis" : "Allies";
            this.running = false;
        }
    }

    // No winner in a test session
    isThisATestSession(){
        let allyCount = 0;
        let axisCount = 0;
        for (let entity of this.startingEntities){
            if (entity instanceof FighterPlane){
                let fighterPlane = entity;
                if (planeModelToAlliance(fighterPlane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        return allyCount == 0 || axisCount == 0;
    }
}
if (typeof window === "undefined"){
    module.exports = Dogfight;
}