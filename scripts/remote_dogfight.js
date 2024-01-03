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
        this.gameTickLock = new Lock();
        this.tickManager.setStartTime(startTime);
        this.tickManager.setNumTicks(numTicks);
        this.running = true;
        this.awaitingState = null;
        for (let entity of startingEntities){
            if (entity.getID() == USER_DATA["name"]){
                this.scene.setFocusedEntity(entity);
                break;
            }
        }
        this.scene.enableTicks();
        this.scene.enableDisplay();
        this.scene.disableCollisions();
        this.sceneID = 0; // Ficticious just because I was thinking of planes when I made the ValueHistoryManager
        this.version = null;
        this.serverConnection = serverConnection;
        this.serverDataLock = new Lock();
        this.inputHistory = new ValueHistoryManager(fileData["constants"]["SAVED_TICKS"]);
        this.testVar = 0;
        this.testVar2 = 0;
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
        // TODO: Error handling
        this.serverDataLock.unlock();
        this.awaitingState = state;
    }

    async tick(){
        if (this.gameTickLock.notReady() || !this.isRunning()){
            return;
        }
        this.gameTickLock.lock();
        await this.serverDataLock.awaitUnlock(true);
        let x1 = 0;
        let x2 = 0;
        let t1 = 0;
        let t2 = 0;
        if (this.awaitingState){
            /*let xt1 = scene.getEntity("p_Allies_0").getX();
            x1 = scene.getEntity("p_Allies_1").getX();
            t1 = this.tickManager.getNumTicks();
            */
            this.updateState(this.awaitingState);
            /*x2 = scene.getEntity("p_Allies_1").getX();
            let xt2 = scene.getEntity("p_Allies_0").getX();
            console.log("hpdiff %d, rpdiff %d, posdif %d", xt2-xt1, x2-x1, this.awaitingState["planes"][0]["x"] - this.awaitingState["planes"][1]["x"])
            t2 = this.tickManager.getNumTicks();
            */
            this.awaitingState = null;
        }
        // Now tick
        this.tickManager.tick();
        /*if (x1 != 0){
            let x3 = scene.getEntity("p_Allies_1").getX();
            let t3 = this.tickManager.getNumTicks();
            //console.log("x2-x1: %d, tickDiff: %d, (x2-x1)/tickDiff: %d, t2: %d, t1: %d\nx3-x2: %d, t3-t2: %d, expected: %d", x2 - x1, t2 - t1, (x2 - x1)/(t2 - t1), t2, t1, x3-x2, t3-t2, this.tickManager.getExpectedTicks())
        }
        let oldTestVar = this.tickManager.getExpectedTicks();
        this.oldTestVar = this.tickManager.getExpectedTicks();
        let oldTestVar2 = this.testVar2;
        this.testVar2 = this.tickManager.getNumTicks();*/
        //console.log(this.testVar2 - oldTestVar2, this.oldTestVar - oldTestVar)

        this.gameTickLock.unlock();
        if (this.tickManager.getNumTicks() % 50 == 0){
            //console.log(this.tickManager.getNumTicks())
        }
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

    static async create(serverConnection, planeType, planeCounts){
        let readyJSON = {
            "client_id": USER_DATA["name"],
            "user_plane_class": planeType,
            "bot_counts": planeCounts
        }
        serverConnection.sendUDP("READY", JSON.stringify(readyJSON));
        let state = await serverConnection.receiveMail();
        state = JSON.parse(state);
        if (state == null){ debugger; }
        let entities = RemoteDogfight.createNewEntities(state);
        if (planeType["planeClass"] == "freecam"){
            entities.push(new SpectatorCamera(scene))
            entities[entities.length-1].setID(USER_DATA["name"]);
        }
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
            if (USER_DATA["name"] == planeObj["id"]){
                entities.push(RemoteDogfight.createNewHumanPlane(planeObj));
            }else{
                entities.push(RemoteDogfight.createNewRemotePlane(planeObj));
            }
        }
        return entities;
    }
}