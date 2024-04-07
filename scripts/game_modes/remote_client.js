class RemoteClient extends ClientGamemode {
    constructor(){
        super();
        this.asyncUpdateManager = new AsyncUpdateManager();
        this.lastServerState = null;
        this.newServerState = null;
        this.stateLock = new Lock();
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Provides information that the game is not running locally. This game is run by a server and the client is subservient to the server.
        Method Return: Boolean
    */
    runsLocally(){ return false; }

    /*
        Method Name: isPaused
        Method Parameters: None
        Method Description: Provides information that the game is not paused. This type of game cannot pause.
        Method Return: Boolean
    */
    isPaused(){ return false; }

    // TODO: Comments
    pause(){}
    unpause(){}

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
        Method Name: handlePlaneMovementUpdate
        Method Parameters:
            messageJSON:
                A message object containg information about a plane's movement
        Method Description: Updates plane's positions if the information provided is very recent. This makes the game less choppy.
        Method Return: void
    */
    handlePlaneMovementUpdate(messageJSON){
        if (objectHasKey(messageJSON, "game_over") && messageJSON["game_over"]){ return; }
        if (typeof messageJSON["planes"] != typeof []){
            console.log("Broken", messageJSON);
        }
        // Only interested if a tick is NOT in progress
        let tickInProgressLock = this.game.getTickInProgressLock();
        if (tickInProgressLock.isLocked()){ return; }
        tickInProgressLock.lock();

        // Only take this information if numTicks match. It should be fine though if this info is from tick 0 but sent after numTicks++ but will be for both
        if (messageJSON["num_ticks"] == this.game.getNumTicks()){ 
            for (let planeObject of messageJSON["planes"]){
                if (planeObject["basic"]["id"] == this.userEntity.getID()){ continue; }
                let plane = this.game.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
                // If plane not found -> ignore
                if (plane == null){
                    continue;
                }
                plane.loadMovementIfNew(planeObject);
            }
        }
        tickInProgressLock.unlock();
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
        this.client.updateCamera();

        // Tick the scene
        await this.scene.tick(timeGapMS);
        this.correctTicks();

        // Send the current position
        await this.sendPlanePosition();

        // Request state from server
        this.requestStateFromServer();
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: updateCamera
        Method Parameters: None
        Method Description: Ensures the scene is focused on either a camera or a living user plane
        Method Return: void
        TODO: Merge with other update Camera methods
    */
    async requestStateFromServer(){
        await this.stateLock.awaitUnlock(true);
        // Send a request and when received then update the last state from server
        this.newServerState = await this.translator.getState();
        this.stateLock.unlock();
    }

    /*
        Method Name: requestStateFromServer
        Method Parameters: None
        Method Description: Requests a state from the server
        Method Return: void
    */
    async sendLocalPlaneData(){
        // Check if the client is a freecam or a plane, if a plane then send its current position JSON to server
        if (this.userEntity instanceof SpectatorCamera || this.userEntity.isDead()){
            return;
        }
        await this.translator.sendLocalPlaneData(this.userEntity.toJSON());
    }

    /*
        Method Name: loadStateFromServer
        Method Parameters: None
        Method Description: Loads the last received state from the server
        Method Return: void
    */
    async loadStateFromServer(){
        // Update the game based on the server's last state
        await this.stateLock.awaitUnlock(true);
        // Only update if the new state is really new
        if (this.newServerState == null){ return; }
        if (this.lastServerState == null || this.lastServerState["num_ticks"] < this.newServerState["num_ticks"]){
            this.game.loadState(this.newServerState);
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
}