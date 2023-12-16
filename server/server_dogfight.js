const DogFight = require("../scripts/dogfight.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
class ServerDogFight extends DogFight {
    constructor(startingEntities, scene){
        super(startingEntities);
        this.scene = scene;
        this.scene.enableTicks();
        this.scene.enableCollisions();
        this.scene.setEntities(startingEntities);
    }

    getState(){
        let state = {};
        state["planes"] = [];
        for (let entity of this.startingEntities){
            if (entity instanceof MultiplayerBiasedBotFighterPlane && entity.getHealth() > 0){
                state["planes"].push(entity.getState());
            }
        }
        return state;
    }
}
module.exports=ServerDogFight;