const DogFight = require("../scripts/dogfight.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
const MultiplayerServerRemoteFighterPlane = require("./multiplayer_server_remote_fighter_plane.js");
const FILE_DATA = require("../data/data_json.js");
const ValueHistoryManager = require("../scripts/value_history_manager.js");
const Lock = require("../scripts/lock.js");
const HF = require("../scripts/helper_functions.js");
class ServerDogFight extends DogFight {
    constructor(scene){
        super(scene);
        this.lobby = null;
        this.sceneID = 0;
        this.stateHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
        this.inputHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
        this.version = 0;
        this.revertPoint = 0;
        this.revertPointLock = new Lock();
    }

    getScene(){
        return this.scene;
    }

    killPlane(planeID){
        this.getScene.getEntity(planeID).kill();
    }

    start(startingEntitiesJSON, lobby){
        this.lobby = lobby;
        let startingEntities = this.entitiesFromJSON(startingEntitiesJSON);
        this.scene.enableTicks();
        this.scene.enableCollisions();
        this.scene.setEntities(startingEntities);
        this.tickManager.setStartTime(Date.now());
        this.tickManager.setNumTicks(0); // TODO: Is this good?
        super.start(startingEntities);
    }

    entitiesFromJSON(listOfJSONReps){
        let entities = [];

        // Place the entities in the world
        let allyX = fileData["dogfight_settings"]["ally_spawn_x"];
        let allyY = fileData["dogfight_settings"]["ally_spawn_y"];
        let axisX = fileData["dogfight_settings"]["axis_spawn_x"];
        let axisY = fileData["dogfight_settings"]["axis_spawn_y"];

        let allyFacingRight = allyX < axisX;

        for (let jsonRep of listOfJSONReps){
            if (jsonRep["user_plane_class"] != "freecam"){
                let facingRight = (HF.planeModelToAlliance(jsonRep["user_plane_class"]) == "Allies") ? allyFacingRight : !allyFacingRight;
                entities.push(new MultiplayerServerRemoteFighterPlane(jsonRep["user_plane_class"], this.getScene(), this));
                entities[entities.length - 1].setID(jsonRep["client_id"]);
                entities[entities.length - 1].setFacingRight(facingRight);
                entities[entities.length - 1].setLastActions({ "face": facingRight, "turn": 0, "shooting": false, "throttle": 0 });
            }
            for (let entity of this.fromBotCounts(jsonRep["bot_counts"])){
                entities.push(entity);
            }
        }

        for (let entity of entities){
            let planeName = entity.getPlaneClass();
            let x = (HF.planeModelToAlliance(planeName) == "Allies") ? allyX : axisX; 
            let y = (HF.planeModelToAlliance(planeName) == "Allies") ? allyY : axisY;
            let facingRight = (HF.planeModelToAlliance(planeName) == "Allies") ? allyFacingRight : !allyFacingRight;
            let aX = x + HF.randomFloatBetween(-1 * fileData["dogfight_settings"]["spawn_offset"], fileData["dogfight_settings"]["spawn_offset"]);
            let aY = y + HF.randomFloatBetween(-1 * fileData["dogfight_settings"]["spawn_offset"], fileData["dogfight_settings"]["spawn_offset"]);
            entity.setCenterX(aX);
            entity.setCenterY(aY);
        }
        return entities;
    }

    fromBotCounts(botCounts){
        let planes = [];
        for (let [planeName, planeCount] of Object.entries(botCounts)){
            for (let i = 0; i < planeCount; i++){
                planes.push(MultiplayerBiasedBotFighterPlane.createBiasedPlane(planeName, this.getScene(), FILE_DATA));
            }
        }
        return planes;
    }

    getLastInputUpToCurrentTick(id){
        return this.inputHistory.getLastUpTo(id, this.tickManager.getNumTicks());
    }

    getSceneID(){
        return this.sceneID;
    }

    async tick(){
        if (!this.isRunning()){
            return;
        }
        // Go from the point where the last input was received to the current moment
        await this.revertPointLock.awaitUnlock(true);
        let revertPoint = this.revertPoint;
        if (revertPoint < this.tickManager.getNumTicks()){
            this.version++;
            await this.loadState(revertPoint);
            this.tickManager.tickFromTo(revertPoint, this.tickManager.getNumTicks());
        }
        
        // Now tick
        this.tickManager.tick(() => {
            this.sendVersionToClients();
        });
        this.revertPoint = this.tickManager.getNumTicks() + 1;
        this.revertPointLock.unlock();
        this.version++;
    }

    async sendVersionToClients(){
        let state = this.getState();
        await this.stateHistory.put(this.sceneID, this.tickManager.getNumTicks(), state);
        this.lobby.sendAll(JSON.stringify(state));
    }

    getState(){
        let state = { "numTicks": this.tickManager.getNumTicks(), "startTime": this.tickManager.getStartTime(), "version": this.version};
        state["planes"] = [];
        for (let entity of this.startingEntities){
            state["planes"].push(entity.getState());
        }
        return state;
    }

    async loadState(numTicks){
        if (numTicks == this.tickManager.getNumTicks()){ return; }
        let archivedStateNode = await this.stateHistory.get(this.sceneID, numTicks);
        let archivedState = archivedStateNode.getValue();
        for (let entity of this.startingEntities){
            for (let plane of archivedState["planes"]){
                if (entity.getID() == plane["id"]){
                    entity.update(plane);
                }
            }
        }
    }

    async updateFromUser(userUpdate){
        let numTicks = userUpdate["numTicks"];
        this.inputHistory.put(userUpdate["id"], numTicks, userUpdate["lastActions"]);
        await this.revertPointLock.awaitUnlock(true);
        this.revertPoint = Math.min(numTicks, this.revertPoint);
        this.revertPointLock.unlock();
    }
}
module.exports=ServerDogFight;