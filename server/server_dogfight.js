const DogFight = require("../scripts/dogfight.js");
const MultiplayerBiasedBotFighterPlane = require("./multiplayer_bot_fighter_plane.js");
const FILE_DATA = require("../data/data_json.js");
const ValueHistoryManager = require("../scripts/value_history_manager.js");
const Lock = require("../scripts/lock.js");
class ServerDogFight extends DogFight {
    constructor(scene, server){
        super(scene);
        this.server = server;
        this.sceneID = 0;
        this.stateHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
        this.inputHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
        this.version = 0;
        this.revertPoint = 0;
        this.revertPointLock = new Lock();
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
        if (this.tickManager.getNumTicks() % 50 == 0){
            //console.log(this.tickManager.getNumTicks())
        }
    }

    async sendVersionToClients(){
        let state = this.getState();
        await this.stateHistory.put(this.sceneID, this.tickManager.getNumTicks(), state);
        this.server.sendAll(JSON.stringify(state));
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