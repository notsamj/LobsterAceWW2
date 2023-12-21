const DogFight = require("../scripts/dogfight.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
const FILE_DATA = require("../data/data_json.js");
const ValueHistoryManager = require("../scripts/value_history_manager.js");
const Lock = require("../scripts/lock.js");
class ServerDogFight extends DogFight {
    constructor(scene, server){
        super(scene);
        this.server = server;
        this.noUpdateLock = new Lock();
        this.updateLock = new Lock();
        this.sceneID = 0;
        this.stateHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
        this.inputHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
        this.version = 0;
    }

    start(startingEntities){
        this.scene.enableTicks();
        this.scene.enableCollisions();
        this.scene.setEntities(startingEntities);
        super.start(startingEntities);
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
        await this.updateLock.awaitUnlock();
        // Now tick
        this.noUpdateLock.lock();
        this.tickManager.tick();
        this.sendVersionToClients();
        this.noUpdateLock.unlock();
        this.version++;
        if (this.tickManager.getNumTicks() % 500 == 0){
            console.log(this.tickManager.getNumTicks(), this.scene.getEntity("p_Axis_0").getX());
        }
    }

    sendVersionToClients(){
        let state = this.getState();
        this.stateHistory.put(this.sceneID, this.tickManager.getNumTicks(), state);
        this.server.sendAll(JSON.stringify(this.getState()));
    }

    getState(startTime, numTicks, version){
        let state = { "numTicks": this.tickManager.getNumTicks(), "startTime": this.tickManager.getStartTime(), "version": this.version};
        state["planes"] = [];
        for (let entity of this.startingEntities){
            state["planes"].push(entity.getState());
        }
        return state;
    }

    loadState(numTicks){
        if (numTicks == this.tickManager.getNumTicks()){ return; }
        let archivedState = this.stateHistory.get(this.sceneID, numTicks);
        for (let entity of this.startingEntities){
            for (let plane of state["planes"]){
                if (entity.getID() == plane["id"]){
                    entity.update(plane);
                }
            }
        }
    }

    async updateFromUser(userUpdate){
        await this.noUpdateLock.awaitUnlock();
        let numTicks = userUpdate["numTicks"];
        this.updateLock.lock();
        this.inputHistory.put(userUpdate["id"], numTicks, userUpdate["lastActions"]);
        this.tickManager.setNumTicks(numTicks);
        this.loadState(numTicks);
        this.updateLock.unlock();
    }
}
module.exports=ServerDogFight;