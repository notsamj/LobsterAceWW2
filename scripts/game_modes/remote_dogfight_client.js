// TODO: Comment class
// TODO: Extend game mode?
class RemoteDogfightClient {
    constructor(dogfightTranslator){
        this.translator = dogfightTranslator;
        this.stats = new AfterMatchStats();
        this.tickInProgressLock = new Lock();
        this.stateLock = new Lock();
        this.numTicks = 0;
        this.lastServerState = null;
        this.newServerState = null;
        this.userEntity = null;
        this.deadCamera = null;
        this.planes = [];
        this.paused = false;
        this.inputLock = new Lock();
        this.startTime = Date.now();
        this.scene = scene;
        this.scene.setGamemode(this);
        this.scene.enableTicks();
        this.running = false;
        this.gameOver = false;
        this.lastTickTime = Date.now();
        this.lastSentModCount = -1;
        this.asyncUpdateManager = new AsyncUpdateManager();
        this.startUp();
    }

    handlePlaneMovementUpdate(messageJSON){
        if (objectHasKey(messageJSON, "game_over") && messageJSON["game_over"]){ return; }
        // Only interested if a tick is NOT in progress
        if (this.tickInProgressLock.isLocked()){ return; }
        this.tickInProgressLock.lock();

        // Only take this information if numTicks match. It should be fine though if this info is from tick 0 but sent after numTicks++ but will be for both
        if (messageJSON["num_ticks"] == this.numTicks){ 
            for (let planeObject of messageJSON["planes"]){
                if (planeObject["basic"]["id"] == this.userEntity.getID()){ continue; }
                let plane = scene.getPlane(planeObject["basic"]["id"]);
                // If plane not found -> ignore
                if (plane == null){
                    continue;
                }
                plane.loadMovementIfNew(planeObject);
                //plane.updateJustDecisions(planeObject["decisions"]);
            }
        }
        this.tickInProgressLock.unlock();
    }
    getLastTickTime(){ return this.lastTickTime; }
    getTickInProgressLock(){ return this.tickInProgressLock; }

    correctTicks(){ return; }
    getNumTicks(){
        return this.numTicks;
    }

    getStartTime(){
        return this.startTime;
    }

    isPaused(){ return false; }
    runsLocally(){ return false; }

    /// Note: Used to make sure only 1 input per real tick (not per game tick)
    inputAllowed(){
        return this.inputLock.isUnlocked();
    }

    pause(){
        this.paused = true;
        this.translator.pause();
    }

    unpause(){
        this.paused = false;
        this.translator.unpause();
    }

    isRunning(){
        return this.running && !this.isGameOver();
    }

    end(){
        this.translator.end();
    }

    getExpectedTicks(){
        return Math.floor((Date.now() - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    async tick(timeGapMS){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        this.inputLock.unlock(); // TODO: Remove inputlock
        this.lastTickTime = Date.now();
        // Load state from server
        await this.loadStateFromServer();
        // Update camera
        this.updateCamera();

        // Tick the scene
        await scene.tick(timeGapMS);
        this.inputLock.lock();
        this.numTicks++;

        // Send the current position
        await this.sendLocalPlaneData(); // Awaited because have to convert userEntity to json
        // Request state for the next time
        this.requestStateFromServer();
        // Request state from server
        this.tickInProgressLock.unlock();
    }

    updateCamera(){
        if (this.userEntity == null){
            debugger;
        }
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

    async requestStateFromServer(){
        await this.stateLock.awaitUnlock(true);
        // Send a request and when received then update the last state from server
        this.newServerState = await this.translator.getState();
        this.stateLock.unlock();
    }

    async sendLocalPlaneData(){
        // Check if the client is a freecam or a plane, if a plane then send its current position JSON to server
        if (this.userEntity instanceof SpectatorCamera || this.userEntity.isDead()){
            return;
        }
        let userEntityJSON = this.userEntity.toJSON();
        /*let currentModCount = userEntityJSON["movement_mod_count"];
        if (this.lastSentModCount <= currentModCount){
            return;
        }
        this.lastSentModCount = currentModCount;
        // TODO: Change or remote this last sent mod count thing because the plane might shoot so send position
        */
        let messageJSON = userEntityJSON;
        messageJSON["num_ticks"] = this.numTicks;
        await this.translator.sendLocalPlaneData(userEntityJSON);
    }

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

    isGameOver(){
        return this.gameOver;
    }

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
            let plane = scene.getPlane(planeObject["basic"]["id"]);
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
                let plane = scene.getPlane(planeObject["basic"]["id"]);
                if (plane == null){
                    continue;
                }
                plane.loadMovementIfNew(planeObject, tickDifference);
            }
        }

        // Update bullets
        scene.getTeamCombatManager().fromBulletJSON(state["bullets"]);
    }

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

    display(){
        if (this.isGameOver()){
            this.stats.display();
        }
    }

    async startUp(){
        // Get a state from the server and await it then set start time then set up based on the server state
        let state = await this.translator.getState();
        let myID = USER_DATA["name"];
        //console.log(state["planes"])
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