/*
    Class Name: PlaneRadar
    Description: A subclass of Dogfight. Specifically for one involving communication with a server.
*/
class RemoteDogfight extends Dogfight {
    /*
        Method Name: constructor
        Method Parameters:
            serverConnection:
                An object facilitating communication between client and server
            startingEntities:
                The entities currently existing on the scene
            startTime:
                The starting time of the tick manager
            numTicks:
                The number of ticks that have so far elapsed
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(serverConnection, startingEntities, startTime, numTicks){
        super(scene);
        for (let entity of startingEntities){
            entity.setGameMode(this);
        }
        this.scene.setEntities(startingEntities, true);
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
        this.inputHistory = new ValueHistoryManager(FILE_DATA["constants"]["SAVED_TICKS"]);
        this.testVar = 0;
        this.testVar2 = 0;
    }

    /*
        Method Name: getVersion
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getVersion(){
        return this.version;
    }

    /*
        Method Name: getLastInputUpToCurrentTick
        Method Parameters:
            id:
                Id of entity who's input is being looked up
        Method Description: Determine what the last input of an entity
        Method Return: JSON Object
    */
    getLastInputUpToCurrentTick(id){
        return this.inputHistory.getLastUpTo(id, this.tickManager.getNumTicks());
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the end of dogfight text on the screen
        Method Return: void
    */
    display(){
        if (!this.isRunning()){
            Menu.makeText("Winner: " + this.winner, "green", 500, 800, 1000, 300)
        }
    }

    /*
        Method Name: updateFromServer
        Method Parameters:
            stateDATA:
                State about the state of the scene
        Method Description: Updates the dogfight based on information from the server
        Method Return: void
    */
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

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Handles the events that take place in a tick
        Method Return: void
    */
    async tick(){
        if (this.gameTickLock.notReady() || !this.isRunning()){
            return;
        }
        this.gameTickLock.lock();
        await this.serverDataLock.awaitUnlock(true);

        if (this.awaitingState){
            this.updateState(this.awaitingState);
            this.awaitingState = null;
        }

        // Now tick
        this.tickManager.tick();

        this.gameTickLock.unlock();
    }

    /*
        Method Name: informServer
        Method Parameters:
            stats:
                A json object of stats of a plane
        Method Description: Sends information about the user plane to the server
        Method Return: void
    */
    informServer(stats){
        stats["numTicks"] = this.tickManager.getNumTicks();
        this.serverConnection.sendUDP("CLIENTPLANE", JSON.stringify(stats))
    }

    /*
        Method Name: updateState
        Method Parameters:
            state:
                State sent by the server
        Method Description: Updates the client state based on the server state
        Method Return: void
    */
    updateState(state){
        this.version = state["version"];
        this.tickManager.setNumTicks(state["numTicks"]); // Make sure this is done so it can catch up with the server
        this.scene.forceUpdatePlanes(state["planes"]);
    }

    /*
        Method Name: addNewPlane
        Method Parameters:
            planeObj:
                JSON Object with information about a plane
        Method Description: Adds a new plane given a JSON object
        Method Return: void
    */
    addNewPlane(planeObj){
        let plane = RemoteDogfight.createNewPlane(planeObj);
        this.scene.addEntity(plane, idSet=true);
    }

    /*
        Method Name: create
        Method Parameters:
            serverConnection:
                An object facilitating communication between client and server
            planeType:
                Plane type of the user (could also be a freecam)
            planeCounts:
                Number of planes the user is bringing to the dogfight
        Method Description: Establishes a connection to the server and a new dogfight
        Method Return: RemoteDogfight
    */
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

    /*
        Method Name: createNewRemotePlane
        Method Parameters:
            planeObj:
                JSON Object with information about a plane
        Method Description: Creates a new remote plane, given an object describing it
        Method Return: MultiplayerRemoteFighterPlane
    */
    static createNewRemotePlane(planeObj){
        let plane = new MultiplayerRemoteFighterPlane(planeObj["plane_class"], scene, activeGameMode, planeObj["rotation_time"], planeObj["speed"], planeObj["max_speed"], planeObj["throttle_constant"], planeObj["health"], planeObj["lastActions"], planeObj["angle"], planeObj["facing"]);
        plane.setID(planeObj["id"]);
        plane.update(planeObj);
        return plane;
    }

    /*
        Method Name: createNewHumanPlane
        Method Parameters:
            planeObj:
                JSON Object with information about a plane
        Method Description: Creates a new human plane, given an object describing it
        Method Return: MultiplayerHumanFighterPlane
    */
    static createNewHumanPlane(planeObj){
        // planeClass, scene, angle=0, facingRight=true
        let plane = new MultiplayerHumanFighterPlane(planeObj["plane_class"], scene);
        plane.update(planeObj);
        plane.setID(planeObj["id"]);
        console.log("New plane", plane.isFacingRight(), planeObj)
        return plane;
    }

    /*
        Method Name: createNewEntities
        Method Parameters:
            state:
                State of the dogfight including all entities
        Method Description: Creates a list of entities based on information from the server state
        Method Return: List of entities
    */
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