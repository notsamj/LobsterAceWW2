class RemoteDogfight extends Dogfight {
    constructor(serverConnection, startingEntities){
        super(startingEntities, this.scene);
        this.scene.setEntities(this.startingEntities, true);
        // Temp
        let cam = new SpectatorCamera(this.scene);
        this.scene.addEntity(cam);
        this.scene.setFocusedEntity(cam);
        this.scene.enableTicks();
        this.scene.enableDisplay();
        this.scene.disableCollisions();
        this.sceneID = 0; // Ficticious just because I was thinking of planes when I made the ValueHistoryManager
        this.version = null;
        this.serverConnection = serverConnection;
        this.serverDataLock = new Lock();
        this.planeMovements = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
    }

    getVersion(){
        return this.version;
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }

    async updateFromServer(stateDATA){
        if (this.serverDataLock.notReady()){ return; }
        // Get state from server
        this.serverDataLock.lock();
        let state = JSON.parse(stateDATA);
        if (state["version"] == this.version){
            this.serverDataLock.unlock();
            return;
        }
        // Update game based on state
        await this.tickManager.awaitUnlock(true);
        this.updateState(state);
        this.tickManager.unlock();
        // TODO: Error handling
        this.serverDataLock.unlock();
    }

    tick(){
        // TODO: Put this back in this.previousStates.put(numTicks % fileData["constants"]["SAVED_TICKS"], this.getState());
        if (!this.serverDataLock.isReady() || !this.isRunning()){
            return;
        }
        // Now tick
        this.tickManager.tick();
        this.sendServerUpdate();
    }

    sendServerUpdate(){
        this.serverConnection.send()
    }

    updateState(state){
        this.version = state["version"];
        this.tickManager.setNumTicks(state["numTicks"]); // Make sure this is done so it can catch up with the server
        this.scene.forceUpdatePlanes(state["planes"]);
        while (numTicks < getExpectedTicks()){
            this.scene.tick(fileData["constants"]["MS_BETWEEN_TICKS"], true);
            numTicks++;
        }
    }

    addNewPlane(planeObj){
        let plane = RemoteDogfight.createNewPlane(planeObj);
        this.scene.addEntity(plane, idSet=true);
    }

    static async create(serverConnection){
        // TODO: JOIN_{PLANE_TYPE}
        let state = await serverConnection.requestTCP("PUT_JOIN_CAM");
        state = JSON.parse(state);
        if (state == null){ debugger; }
        this.tickManager.setStartTime(state["startTime"]);
        this.tickManager.setNumTicks(state["numTicks"]);
        // temp
        let cam = new SpectatorCamera(this.scene);
        let entities = RemoteDogfight.createNewEntities(state);
        entities.push(cam);
        cam.setID(500); // temp
        cam.setCenterX(0);
        cam.setCenterY(0);
        return new RemoteDogfight(serverConnection, entities);
    }

    static createNewPlane(planeObj){
        let plane = new MultiplayerRemoteFighterPlane(planeObj["plane_class"], this.scene, this, planeObj["rotation_time"], planeObj["speed"], planeObj["max_speed"], planeObj["throttle_constant"], planeObj["health"], planeObj["lastActions"], planeObj["angle"], planeObj["facing"]);
        plane.setID(planeObj["id"]);
        plane.setCenterX(planeObj["x"]);
        plane.setCenterY(planeObj["y"]);
        return plane;
    }

    static createNewEntities(state){
        let entities = []; 
        for (let planeObj of state["planes"]){
            entities.push(RemoteDogfight.createNewPlane(planeObj));
        }
        return entities;
    }
}