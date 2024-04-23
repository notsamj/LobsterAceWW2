/*
    Class Name: RemoteClient
    Description: A client for remote gamemodes
*/
class RemoteClient extends GamemodeClient {
    /*
        Method Name: constructor
        Method Parameters:
            gamemode:
                A gamemode that is run remotely
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(gamemode){
        super(gamemode);
        this.asyncUpdateManager = new AsyncUpdateManager();
        this.lastServerState = null;
        this.newServerState = null;
        this.lastTickTime = Date.now();
        this.stateLock = new Lock();
        this.translator = new GamemodeRemoteTranslator();
        this.tickInProgressLock = this.gamemode.getTickInProgressLock();
        this.gamemode.startUp(this, this.translator);
    }

    /*
        Method Name: getAsyncUpdateManager
        Method Parameters: None
        Method Description: Getter
        Method Return: AsyncUpdateManager
    */
    getAsyncUpdateManager(){
        return this.asyncUpdateManager;
    }

    /*
        Method Name: getLastTickTime
        Method Parameters: None
        Method Description: Getter
        Method Return: Integer
    */
    getLastTickTime(){
        return this.lastTickTime;
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
        // Only interested if a tick is NOT in progress
        if (this.tickInProgressLock.isLocked()){ return; }
        this.tickInProgressLock.lock();

        // Only take this information if numTicks match. It should be fine though if this info is from tick 0 but sent after numTicks++ but will be for both
        if (messageJSON["num_ticks"] == this.gamemode.getNumTicks()){ 
            for (let planeObject of messageJSON["planes"]){
                if (planeObject["basic"]["id"] == this.gamemode.getUserEntity().getID()){ continue; }
                let plane = this.gamemode.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
                // If plane not found -> ignore
                if (plane == null){
                    continue;
                }
                plane.loadMovementIfNew(planeObject);
            }
        }
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Determines the expected number of ticks that have occured
        Method Return: integer
    */
    getExpectedTicks(){
        return Math.floor((Date.now() - this.gamemode.getStartTime()) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Handles all operations that happen every tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.gamemode.getNumTicks() >= this.getExpectedTicks()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        this.lastTickTime = Date.now();

        // Load state from server
        await this.loadStateFromServer();

        // Update camera
        this.updateCamera();

        // Tick the scene
        await this.gamemode.getTeamCombatManager().tick();
        await this.gamemode.getScene().tick();
        this.gamemode.correctTicks();

        // Send the current position
        await this.sendLocalPlaneData();

        // Request state from server
        this.requestStateFromServer();
        this.tickInProgressLock.unlock();
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
        Method Name: requestStateFromServer
        Method Parameters: None
        Method Description: Requests a state from the server
        Method Return: void
    */
    async sendLocalPlaneData(){
        // Check if the client is a freecam or a plane, if a plane then send its current position JSON to server
        let userEntity = this.gamemode.getUserEntity();
        if (this.gamemode.getUserEntity() instanceof SpectatorCamera || userEntity.isDead()){
            return;
        }
        let userJSON = userEntity.toJSON();
        userJSON["num_ticks"] = this.gamemode.getNumTicks();
        await this.translator.sendLocalPlaneData(userJSON);
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
            this.gamemode.loadState(this.newServerState);
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