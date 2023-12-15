var GameModeClass;
if (typeof window === "undefined"){
    GameModeClass = require("../scripts/game_mode.js");
}else{
    GameModeClass = GameMode;
}
class Dogfight extends GameModeClass {
    constructor(startingEntities){
        super();
        this.startingEntities = startingEntities;
        this.running = true;
        this.winner = null;
        this.isATestSession = this.isThisATestSession();
    }

    isRunning(){
        return this.running;
    }

    tick(){
        if (!this.isRunning()){
            return;
        }
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