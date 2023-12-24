if (typeof window === "undefined"){
    GameMode = require("../scripts/game_mode.js");
    FighterPlane = require("../scripts/fighter_plane.js");
    SceneTickManager = require("../scripts/scene_tick_manager.js");
    var planeModelToAlliance = require("../scripts/helper_functions.js").planeModelToAlliance;
    fileData = require("../data/data_json.js");
}
class Dogfight extends GameMode {
    constructor(scene){
        super();
        this.scene = scene;
        this.startingEntities = [];
        this.running = false;
        this.winner = null;
        this.isATestSession = false;
        this.tickManager = new SceneTickManager(Date.now(), this.scene, fileData["constants"]["MS_BETWEEN_TICKS"]);
        //this.lastX = 0;
    }

    start(startingEntities){
        this.startingEntities = startingEntities;
        this.isATestSession = this.isThisATestSession();
        this.running = true;
        this.tickManager.setStartTime(Date.now());
    }

    getTickManager(){
        return this.tickManager;
    }

    isRunning(){
        return this.running;
    }

    async tick(){
        if (!this.isRunning()){
            return;
        }
        await this.tickManager.tick();
        //let lastX = this.lastX;
        //this.lastX = this.scene.getPlanes()[0].getX();
        //console.log(this.lastX - lastX);
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