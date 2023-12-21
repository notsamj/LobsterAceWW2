class RemoteDogfight extends Dogfight {
    constructor(serverConnection, startingEntities, startTime, numTicks){
        super(scene);
        for (let entity of startingEntities){
            entity.setGameMode(this);
        }
        this.scene.setEntities(startingEntities, true);
        /*// Temp
        let cam = new SpectatorCamera(this.scene);
        this.scene.addEntity(cam);
        this.scene.setFocusedEntity(cam);*/
        this.tickManager.setStartTime(startTime);
        this.tickManager.setNumTicks(numTicks);
        this.running = true;
        this.scene.setFocusedEntity(startingEntities[startingEntities[startingEntities.length - 1].getID() != "freecam" ? 0 : startingEntities.length - 1]);
        this.scene.enableTicks();
        this.scene.enableDisplay();
        this.scene.disableCollisions();
        this.sceneID = 0; // Ficticious just because I was thinking of planes when I made the ValueHistoryManager
        this.version = null;
        this.serverConnection = serverConnection;
        this.serverDataLock = new Lock();
        this.inputHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
    }

    getVersion(){
        return this.version;
    }

    getLastInputUpToCurrentTick(id){
        return this.inputHistory.getLastUpTo(id, this.tickManager.getNumTicks());
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
    }

    informServer(stats){
        stats["numTicks"] = this.tickManager.getNumTicks();
        this.serverConnection.sendUDP("CLIENTPLANE", JSON.stringify(stats))
    }

    updateState(state){
        this.version = state["version"];
        //console.log(state["numTicks"] - this.tickManager.getNumTicks())
        this.tickManager.setNumTicks(state["numTicks"]); // Make sure this is done so it can catch up with the server
        this.scene.forceUpdatePlanes(state["planes"]);
    }

    addNewPlane(planeObj){
        let plane = RemoteDogfight.createNewPlane(planeObj);
        this.scene.addEntity(plane, idSet=true);
    }

    static async create(serverConnection){
        // TODO: JOIN_{PLANE_TYPE}
        let temp = {"planeClass": "spitfire", "clientID": "Samuel"};
        //let temp = {"planeClass": "freecam", "clientID": "Samuel"};
        let state = await serverConnection.requestTCP("JOIN_" + JSON.stringify(temp));
        state = JSON.parse(state);
        if (state == null){ debugger; }
        let entities = RemoteDogfight.createNewEntities(state);
        if (temp["planeClass"] == "freecam"){
            entities.push(new SpectatorCamera(scene))
        }
        /*// temp
        let cam = new SpectatorCamera(this.scene);
        entities.push(cam);
        cam.setID(500); // temp
        cam.setCenterX(0);
        cam.setCenterY(0);*/
        return new RemoteDogfight(serverConnection, entities, state["startTime"], state["numTicks"]);
    }

    static createNewRemotePlane(planeObj){
        let plane = new MultiplayerRemoteFighterPlane(planeObj["plane_class"], scene, activeGameMode, planeObj["rotation_time"], planeObj["speed"], planeObj["max_speed"], planeObj["throttle_constant"], planeObj["health"], planeObj["lastActions"], planeObj["angle"], planeObj["facing"]);
        plane.setID(planeObj["id"]);
        plane.update(planeObj);
        return plane;
    }

    static createNewHumanPlane(planeObj){
        // planeClass, scene, angle=0, facingRight=true
        let plane = new MultiplayerHumanFighterPlane(planeObj["plane_class"], scene);
        plane.update(planeObj);
        plane.setID(planeObj["id"]);
        return plane;
    }

    static createNewEntities(state){
        let entities = []; 
        for (let planeObj of state["planes"]){
            if (state["YOUR_PLANE"] == planeObj["id"]){
                entities.push(RemoteDogfight.createNewHumanPlane(planeObj));
            }else{
                entities.push(RemoteDogfight.createNewRemotePlane(planeObj));
            }
        }
        return entities;
    }
}