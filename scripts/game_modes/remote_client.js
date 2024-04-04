class RemoteClient extends ClientGamemode {
    constructor(){
        super();
        this.asyncUpdateManager = new AsyncUpdateManager();
        this.lastServerState = null;
        this.newServerState = null;
        this.userEntity = null;
        this.deadCamera = null;
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
        if (this.tickInProgressLock.isLocked()){ return; }
        this.tickInProgressLock.lock();

        // Only take this information if numTicks match. It should be fine though if this info is from tick 0 but sent after numTicks++ but will be for both
        if (messageJSON["num_ticks"] == this.numTicks){ 
            for (let planeObject of messageJSON["planes"]){
                if (planeObject["basic"]["id"] == this.userEntity.getID()){ continue; }
                let plane = scene.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
                // If plane not found -> ignore
                if (plane == null){
                    continue;
                }
                plane.loadMovementIfNew(planeObject);
            }
        }
        this.tickInProgressLock.unlock();
    }
}