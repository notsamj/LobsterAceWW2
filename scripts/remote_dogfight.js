class RemoteDogfight extends Dogfight {
    constructor(serverConnection, startingEntities){
        super(startingEntities);
        scene.setEntities(this.startingEntities, true);
        // Temp
        let cam = new SpectatorCamera(scene);
        scene.addEntity(cam);
        scene.setFocusedEntity(cam);
        //scene.setFocusedEntity(500); // temp
        scene.enableTicks();
        scene.enableDisplay();
        scene.disableCollisions();
        this.version = null;
        this.serverConnection = serverConnection;
        this.tickLock = new Lock();
        this.serverDataLock = new Lock();
        this.previousStates = new NotSamArrayList(null, fileData["constants"]["SAVED_TICKS"]);
    }

    getVersion(){
        return this.version;
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }

    async tick(){
        // TODO: Put this back in this.previousStates.put(numTicks % fileData["constants"]["SAVED_TICKS"], this.getState());
        if (!this.serverDataLock.isReady() || !this.tickLock.isReady()){
            return;
        }
        //await this.updateDelay.awaitUnlock();
        // Get state from server
        this.serverDataLock.lock();
        let state = await this.serverConnection.requestTCP("STATE");
        state = JSON.parse(state);
        if (state["version"] == this.version){
            return;
        }
        this.version = state["version"];
        // TODO: Error handling
        this.serverDataLock.unlock();
        //let timeTwo = Date.now(),
        // Update game based on state
        this.tickLock.lock();
        this.updateState(state);
        this.tickLock.unlock();
        //this.updateDelay.lock();
    }

    getState(){
        // TODO: Get all the data for the lastActions of the local plane and put it here to send to the server and for using to update the forcedTicks
    }

    updateState(state){
        numTicks = state["numTicks"]; // Make sure this is done so it can catch up with the server
        scene.forceUpdatePlanes(state["planes"]);
        while (numTicks < getExpectedTicks()){
            scene.tick(fileData["constants"]["MS_BETWEEN_TICKS"], true);
            numTicks++;
        }
    }

    addNewPlane(planeObj){
        let plane = RemoteDogfight.createNewPlane(planeObj);
        scene.addEntity(plane, idSet=true);
    }

    allowingSceneTicks(){
        return this.tickLock.isReady();
    }

    static async create(serverConnection){
        let state = await serverConnection.requestTCP("STATE");
        state = JSON.parse(state);
        if (state == null){ debugger; }
        startTime = state["startTime"];
        numTicks = state["numTicks"];
        // temp
        let cam = new SpectatorCamera(scene);
        let entities = RemoteDogfight.createNewEntities(state);
        entities.push(cam);
        cam.setID(500); // temp
        cam.setCenterX(0);
        cam.setCenterY(0);
        return new RemoteDogfight(serverConnection, entities);
    }

    static createNewPlane(planeObj){
        let plane = new MultiplayerRemoteFighterPlane(planeObj["plane_class"], scene, this, planeObj["rotation_time"], planeObj["speed"], planeObj["max_speed"], planeObj["throttle_constant"], planeObj["health"], planeObj["lastActions"], planeObj["angle"], planeObj["facing"]);
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