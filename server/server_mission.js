const TickScheduler = require("../scripts/misc/tick_scheduler.js");
const Lock = require("../scripts/general/lock.js");
const Mission = require("../scripts/gamemodes/mission.js");
const PROGRAM_DATA = require("../data/data_json.js");
const AsyncUpdateManager = require("../scripts/general/async_update_manager.js");
/*
    Class Name: ServerMisson
    Description: Subclass of Mission meant for a mission running on a server
*/
class ServerMisson extends Mission {
    /*
        Method Name: constructor
        Method Parameters:
            missionSetupJSON:
                A json object with information on the settings of a dogfight
            gameHandler:
                A gamehandler object
            serverObject:
                A WW2PGServer object
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(missionSetupJSON, gameHandler, serverObject){
        super(PROGRAM_DATA["missions"][missionSetupJSON["mission_id"]], missionSetupJSON);
        this.serverObject = serverObject;
        this.gameHandler = gameHandler;
        this.bulletPhysicsEnabled = missionSetupJSON["bullet_physics_enabled"];

        this.tickInProgressLock = new Lock();
        this.userInputLock = new Lock();

        this.tickScheduler = new TickScheduler(() => { this.tick(); }, PROGRAM_DATA["settings"]["ms_between_ticks"] / 2, Date.now());
        this.lastState = this.generateState(); 
        
        this.asyncUpdateManager = new AsyncUpdateManager();
        this.running = true;
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Determines if the Mission runs locally
        Method Return: Boolean
    */
    runsLocally(){
        return true;
    }

    /*
        Method Name: playerDisconnected
        Method Parameters:
            username:
                The username of the player that has disconnected
        Method Description: Kills off a player who has disconnected
        Method Return: void
    */
    playerDisconnected(username){
        for (let plane of this.planes){
            if (plane.getID() == username){
                plane.die();
            }
        }
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Ends a game
        Method Return: void
    */
    end(){
        this.running = false;
        this.gameOver = true;
        this.tickScheduler.end();
        this.gameHandler.gameOver(this.generateState());
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.tickScheduler.getExpectedTicks()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        this.defenderSpawnLock.tick();
        this.attackerSpawnLock.tick();

        // Tick the scene
        this.teamCombatManager.tick();
        this.checkForEnd();
        this.checkSpawn();
        this.numTicks++;

        // Save current state and update from user input
        await this.updateFromUserInput(); // Note: I moved this here on 2024-04-11 before sleeping I didn't test it. Was previosuly right after this.generateState()
        this.lastState = this.generateState();
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: getLastState
        Method Parameters: None
        Method Description: Getter
        Method Return: JSON object representing the last state of the game produced
    */
    getLastState(){
        return this.lastState;
    }

    /*
        Method Name: generateState
        Method Parameters: None
        Method Description: Generates a representation of the current game state
        Method Return: A JSON Object representing the current game state
    */
    generateState(){
        let stateRep = {};
        stateRep["mission_id"] = this.missionObject["id"];
        stateRep["num_ticks"] = this.numTicks;
        stateRep["start_time"] = this.tickScheduler.getStartTime();
        stateRep["game_over"] = this.isGameOver()
        // Send different things if running
        if (this.isRunning()){
            // Add sound
            stateRep["sound_list"] = this.soundManager.getSoundRequestList();
            this.soundManager.clearRequests();
            // Add planes
            stateRep["planes"] = this.teamCombatManager.getPlaneJSON();
            // Add bullets
            stateRep["bullets"] = this.teamCombatManager.getBulletJSON();
            // Add bombs
            stateRep["bombs"] = this.teamCombatManager.getBombJSON();
            // Add buldings
            stateRep["buildings"] = this.teamCombatManager.getBuildingJSON();
            // Lock timers
            stateRep["attacker_spawn_ticks_left"] = this.attackerSpawnLock.getTicksLeft();
            stateRep["defender_spawn_ticks_left"] = this.defenderSpawnLock.getTicksLeft();
            // Send out specicially the positions
            this.serverObject.sendAllWithCondition({"mail_box": "plane_movement_update", "planes": stateRep["planes"], "num_ticks": this.numTicks}, (client) => {
                return client.getState() == PROGRAM_DATA["client_states"]["in_game"];
            });
        }else{
            // Add after match stats
            stateRep["stats"] = this.statsManager.toJSON();
        }
        return stateRep;
    }

    /*
        Method Name: updateFromUserInput
        Method Parameters: None
        Method Description: Updates a plane from the user input received from a client
        Method Return: void
    */
    async updateFromUserInput(){
        await this.userInputLock.awaitUnlock(true);
        // Update all planes based on user input
        for (let plane of this.teamCombatManager.getLivingPlanes()){
            let planeID = plane.getID();
            let latestPlaneUpdate = await this.asyncUpdateManager.getLastUpTo(planeID, this.numTicks);
            if (latestPlaneUpdate == null){ continue; }
            let tickDifference = this.numTicks - latestPlaneUpdate["num_ticks"];
            // Note: tickDifference MUST be >= 0 because of how the update was obtained
            //plane.loadImportantData(latestPlaneUpdate);
            plane.loadDecisions(latestPlaneUpdate);
            plane.loadMovementIfNew(latestPlaneUpdate, tickDifference);
        }
        await this.asyncUpdateManager.deletionProcedure(this.numTicks);
        this.userInputLock.unlock();
    }

    /*
        Method Name: newPlaneJSON
        Method Parameters: None
        Method Description: Handles a JSON object of plane information received from a client
        Method Return: void
    */
    async newPlaneJSON(planeJSON){
        await this.userInputLock.awaitUnlock(true);
        let numTicks = planeJSON["num_ticks"];
        let id = planeJSON["basic"]["id"];
        await this.asyncUpdateManager.put(id, numTicks, planeJSON);
        this.serverObject.sendAllWithCondition({"mail_box": "plane_movement_update", "planes": [planeJSON], "num_ticks": planeJSON["num_ticks"]}, (client) => {
            return client.getState() == PROGRAM_DATA["client_states"]["in_game"] && client.getUsername() != planeJSON["id"];
        });
        this.userInputLock.unlock();
    }
}
module.exports=ServerMisson;