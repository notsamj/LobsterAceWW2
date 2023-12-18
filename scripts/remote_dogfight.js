class RemoteDogfight extends Dogfight {
    constructor(serverConnection, startingEntities){
        super(startingEntities);
        scene.setEntities(this.startingEntities, true);
        scene.setFocusedEntity(this.startingEntities[0].getID());
        scene.setFocusedEntity(500); // temp
        scene.enableTicks();
        scene.enableDisplay();
        scene.disableCollisions();
        this.serverConnection = serverConnection;
        this.tickLock = new Lock();
        this.serverDataLock = new Lock();
    }

    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }

    async tick(){
        if (!this.serverDataLock.isReady() || !this.tickLock.isReady()){
            return;
        }
        // Get state from server
        this.serverDataLock.lock();
        let state = await this.serverConnection.requestGET("state");
        // TODO: Error handling
        this.serverDataLock.unlock();
        
        // Update game based on state
        this.tickLock.lock();
        this.updateState(state);
        this.tickLock.unlock();
    }

    updateState(state){
        numTicks = state["numTicks"]; // Make sure this is done so it can catch up with the server
        // TODO: Account for dead planes and bullets
        for (let planeObj of state["planes"]){
            if (scene.hasEntity(planeObj["id"])){
                let plane = scene.getEntity(planeObj["id"]);
                plane.updateStats(planeObj);
            }else{
                this.addNewPlane(planeObj);
            }
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
        let state = await serverConnection.requestGET("state");
        startTime = state["starTime"];
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
        let plane = new MultiplayerRemoteFighterPlane(planeObj["plane_class"], scene, planeObj["rotation_time"], planeObj["speed"], planeObj["max_speed"], planeObj["throttle_constant"], planeObj["health"], planeObj["lastActions"], planeObj["angle"], planeObj["facing"]);
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