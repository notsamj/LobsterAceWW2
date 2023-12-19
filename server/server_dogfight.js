const DogFight = require("../scripts/dogfight.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
const FILE_DATA = require("../data/data_json.js");
class ServerDogFight extends DogFight {
    constructor(startingEntities, scene){
        super(startingEntities);
        this.scene = scene;
        this.scene.enableTicks();
        this.scene.enableCollisions();
        this.scene.setEntities(startingEntities);
        this.inputHistory = this.initInputHistory();
    }

    initInputHistory(){
        
    }

    getState(startTime, numTicks, version){
        let state = { "numTicks": numTicks, "startTime": startTime, "version": version};
        state["planes"] = [];
        for (let entity of this.startingEntities){
            state["planes"].push(entity.getState());
        }
        return state;
    }

    updateInputHistory(numTicks){
        for (let entity of this.startingEntities){
            state["planes"].push(entity.getState());
            this.inputHistory[entity.getID()][numTicks%FILE_DATA["constants"]["SAVED_TICKS"]] = entity.getState()["last_actions"];
        }
    }

    updateClient(dataJSON){
        let planeID = dataJSON["id"];
        this.teamCombatManager.getEntity(planeID).update(dataJSON);
    }
}
module.exports=ServerDogFight;