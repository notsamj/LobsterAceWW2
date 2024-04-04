/*
    Class Name: RemoteDogfightClient
    Description: A client for participating in a Dogfight run by a server.
*/
class RemoteDogfightClient extends RemoteClient {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.translator = new GamemodeRemoteTranslator();
        this.stats = new AfterMatchStats();
        this.stateLock = new Lock();
        this.planes = [];
        this.startTime = Date.now();
        this.scene = scene;
        this.scene.setGamemode(this);
        this.scene.enableTicks();
        this.gameOver = false;
        this.lastTickTime = Date.now();
        this.startUp();
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Placeholder. No use.
        Method Return: void
    */
    pause(){}

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Placeholder. No use.
        Method Return: void
    */
    unpause(){}

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Determines if the game is running
        Method Return: Boolean
    */
    isRunning(){
        return this.running && !this.isGameOver();
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Communicates to the server that the user is exiting
        Method Return: void
    */
    end(){
        this.translator.end();
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Determines the expected number of ticks that have occured
        Method Return: integer
    */
    getExpectedTicks(){
        return Math.floor((Date.now() - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    /*
        Method Name: tick
        Method Parameters:
            timeGapMS:
                The amount of time elasped during a tick
        Method Description: Handles all operations that happen every tick
        Method Return: void
    */
    async tick(timeGapMS){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        this.lastTickTime = Date.now();
        // Load state from server
        await this.loadStateFromServer();
        // Update camera
        this.updateCamera();

        // Tick the scene
        await scene.tick(timeGapMS);
        this.correctTicks();

        // Send the current position
        await this.sendLocalPlaneData(); // Awaited because have to convert userEntity to json
        // Request state for the next time
        this.requestStateFromServer();
        // Request state from server
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: updateCamera
        Method Parameters: None
        Method Description: Ensures the scene is focused on either a camera or a living user plane
        Method Return: void
        TODO: Merge with other update Camera methods
    */
    updateCamera(){
        // No need to update if user is meant to be a camera
        if (this.userEntity instanceof SpectatorCamera){
            return;
        }else if (this.userEntity.isAlive() && this.deadCamera == null){ // No need to do anything if following user
            return;
        }

        // if the user is dead then switch to dead camera
        if (this.userEntity.isDead() && this.deadCamera == null){
            this.deadCamera = new SpectatorCamera(scene, this.userEntity.getX(), this.userEntity.getY());
            scene.addEntity(this.deadCamera);
            scene.setFocusedEntity(this.deadCamera);
        }else if (this.userEntity.isAlive() && this.deadCamera != null){ // More appropriate for campaign (resurrection) but whatever
            this.deadCamera.die(); // Kill so automatically deleted by scene
            this.deadCamera = null;
            scene.setFocusedEntity(this.userEntity);
        }
    }

    /*
        Method Name: requestStateFromServer
        Method Parameters: None
        Method Description: Requests a state from the server
        Method Return: void
    */
    async requestStateFromServer(){
        await this.stateLock.awaitUnlock(true);
        // Send a request and when received then update the last state from server
        this.newServerState = await this.translator.getState();
        this.stateLock.unlock();
    }

    /*
        Method Name: sendLocalPlaneData
        Method Parameters: None
        Method Description: Sends information about the user's plane to the server
        Method Return: void
    */
    async sendLocalPlaneData(){
        // Check if the client is a freecam or a plane, if a plane then send its current position JSON to server
        if (this.userEntity instanceof SpectatorCamera || this.userEntity.isDead()){
            return;
        }
        let userEntityJSON = this.userEntity.toJSON();
        let messageJSON = userEntityJSON;
        messageJSON["num_ticks"] = this.numTicks;
        await this.translator.sendLocalPlaneData(userEntityJSON);
    }

    /*
        Method Name: loadStateFromServer
        Method Parameters: None
        Method Description: Loads the last received state from the server
        Method Return: void
    */
    async loadStateFromServer(){
        // Update the scene based on the server's last state
        await this.stateLock.awaitUnlock(true);
        // Only update if the new state is really new
        if (this.newServerState == null){ return; }
        if (this.lastServerState == null || this.lastServerState["num_ticks"] < this.newServerState["num_ticks"]){
            await this.loadState(this.newServerState);
            this.lastServerState = this.newServerState;
        }
        this.stateLock.unlock();
    }

    /*
        Method Name: isGameOver
        Method Parameters: None
        Method Description: Determines if the game is over
        Method Return: Boolean
    */
    isGameOver(){
        return this.gameOver;
    }

    /*
        Method Name: loadState
        Method Parameters: None
        Method Description: Loads a state
        Method Return: void
    */
    async loadState(state){
        if (state == null){ return; }
        // Check game end
        this.gameOver = state["game_over"];
        
        // If not running then load the end
        if (this.isGameOver()){
            this.stats.fromJSON(state["stats"]);
            return;
        }
        
        // Load sounds
        SOUND_MANAGER.fromSoundRequestList(state["sound_list"]);

        // TODO: If tickdifference is great enough then take from server!
        let tickDifference = this.numTicks - state["num_ticks"];
        let planeData = state["planes"];
        if (tickDifference < 0){

        }

        // Update plane general information
        for (let planeObject of planeData){
            let plane = scene.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
            // This is more for campaign (because no planes are added in dogfight) but whateverrrrr
            if (plane == null){
                console.log(planeObject["basic"]["id"])
                debugger;
                this.addNewPlane(planeObject);
                continue;
            }
            plane.loadImportantData(planeObject);
        }

        // Check if update is super future save and try to load if we have one
        if (tickDifference < 0){
            // Tick differnece < 0
            await this.asyncUpdateManager.put("plane_movement_data", this.numTicks, planeData);
            if (await this.asyncUpdateManager.has("plane_movement_data", this.numTicks)){
                planeData = await this.asyncUpdateManager.getValue("plane_movement_data", this.numTicks);
                await this.asyncUpdateManager.deletionProcedure(this.numTicks);
                tickDifference = 0;
            }
        }

        // Update plane movement
        if (tickDifference >= 0){
            for (let planeObject of planeData){
                let plane = scene.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
                if (plane == null){
                    continue;
                }
                plane.loadMovementIfNew(planeObject, tickDifference);
            }
        }

        // Update bullets
        scene.getTeamCombatManager().fromBulletJSON(state["bullets"]);
    }

    /*
        Method Name: addNewPlane
        Method Parameters:
            planeObject:
                A json object with information about a plane
        Method Description: Adds a new plane to the game
        Method Return: void
    */
    addNewPlane(planeObject){
        let isFighter = planeModelToType(planeObject["basic"]["plane_class"]) == "Fighter";
        let isHuman = planeObject["human"];
        let plane;
        if (isHuman && isFighter){
            plane = HumanFighterPlane.fromJSON(planeObject, scene, planeIsMe);
        }else if (isHuman){
            plane = HumanBomberPlane.fromJSON(planeObject, scene, planeIsMe);
        }else if (isFighter){
            plane = BiasedBotFighterPlane.fromJSON(planeObject, scene, false);
        }else{
            plane = BiasedBotBomberPlane.fromJSON(planeObject, scene, false);
        }
        this.scene.addPlane(plane);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays relevant information to the user
        Method Return: void
    */
    display(){
        if (this.isGameOver()){
            this.stats.display();
        }
    }

    /*
        Method Name: startUp
        Method Parameters: None
        Method Description: Prepares the game mode from a state
        Method Return: void
    */
    async startUp(){
        // Get a state from the server and await it then set start time then set up based on the server state
        let state = await this.translator.getState();
        let myID = USER_DATA["name"];
        // Add planes
        for (let planeObject of state["planes"]){
            if (planeObject["basic"]["human"]){
                let planeIsMe = planeObject["basic"]["id"] == myID;
                let plane;
                if (planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter"){
                    plane = HumanFighterPlane.fromJSON(planeObject, scene, planeIsMe);
                }else{
                    plane = HumanBomberPlane.fromJSON(planeObject, scene, planeIsMe);
                }
                if (planeIsMe){
                    this.userEntity = plane;
                }
                this.planes.push(plane);
            }else{
                let plane;
                if (planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter"){
                    plane = BiasedBotFighterPlane.fromJSON(planeObject, scene, false);
                }else{
                    plane = BiasedBotBomberPlane.fromJSON(planeObject, scene, false);
                }
                this.planes.push(plane);
            }
        }

        // Add planes to the scene
        scene.setEntities(this.planes);

        // If no user then add a freecam
        //console.log("Is user entity null?", this.userEntity)
        if (this.userEntity == null){
            let allyX = PROGRAM_DATA["dogfight_settings"]["ally_spawn_x"];
            let allyY = PROGRAM_DATA["dogfight_settings"]["ally_spawn_y"];
            let axisX = PROGRAM_DATA["dogfight_settings"]["axis_spawn_x"];
            let axisY = PROGRAM_DATA["dogfight_settings"]["axis_spawn_y"];
            let middleX = (allyX + axisX) / 2;
            let middleY = (allyY + axisY) / 2;
            this.userEntity = new SpectatorCamera(scene);
            this.userEntity.setCenterX(middleX);
            this.userEntity.setCenterY(middleY);
            scene.addEntity(this.userEntity);
        }
        scene.setFocusedEntity(this.userEntity);
        this.startTime = state["start_time"];
        this.numTicks = state["num_ticks"];
        this.running = true;
    }
}