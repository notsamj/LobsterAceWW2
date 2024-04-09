const SoundManager = require("../scripts/general/sound_manager.js");
const TickScheduler = require("../scripts/tick_scheduler.js");
const Lock = require("../scripts/general/lock.js");
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const helperFunctions = require("../scripts/general/helper_functions.js");
const Mission = require("../scripts/gamemodes/mission.js");
const PROGRAM_DATA = require("../data/data_json.js");
// TODO: Comments
class ServerMisson extends Mission {
    /*
        Method Name: constructor
        Method Parameters:
            missionSetupJSON:
                A json object with information on the settings of a dogfight
            TODO
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(missionSetupJSON, gameHandler){
        super(PROGRAM_DATA["missions"][missionSetupJSON["mission_id"]], missionSetupJSON);
        this.gameHandler = gameHandler;
        this.bulletPhysicsEnabled = missionSetupJSON["bullet_physics_enabled"];

        this.tickInProgressLock = new Lock();
        this.userInputLock = new Lock();
        this.userInputQueue = new NotSamLinkedList();

        this.tickScheduler = new TickScheduler(() => { this.tick(); }, PROGRAM_DATA["settings"]["ms_between_ticks"] / 2, Date.now());
        this.lastState = this.generateState(); 
    }

    runsLocally(){
        return true;
    }

    isPaused(){
        return false;
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
        Method Name: pause
        Method Parameters: None
        Method Description: Dud. Server gamemodes cannot pause.
        Method Return: void
    */
    pause(){}

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Dud. Server gamemodes cannot pause.
        Method Return: void
    */
    unpause(){}

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Determines if the game is running
        Method Return: Boolean, true -> running, false -> not running
    */
    isRunning(){
        return this.running && !this.isGameOver();
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
        Method Name: areBulletPhysicsEnabled
        Method Parameters: None
        Method Description: Provides information about whether bullet physics are enabled in the game
        Method Return: Boolean, true -> bullet physics enabled, false -> bullet physics not enabled
    */
    areBulletPhysicsEnabled(){
        return this.bulletPhysicsEnabled;
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
        await this.scene.tick(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.checkForEnd();
        this.checkSpawn();
        this.numTicks++;

        // Save current state and update from user input
        this.lastState = this.generateState();
        await this.updateFromUserInput();
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
        Method Name: isGameOver
        Method Parameters: None
        Method Description: Checks if the game is over
        Method Return: boolean, true -> the game is over, false -> the game is not over
    */
    isGameOver(){
        return this.gameOver;
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
        stateRep["paused"] = this.isPaused();
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
        if (this.isPaused()){ return; }
        await this.userInputLock.awaitUnlock(true);
        // Update all planes based on user input
        for (let [planeObject, planeIndex] of this.userInputQueue){
            for (let plane of this.teamCombatManager.getLivingPlanes()){
                if (plane.getID() == planeObject["basic"]["id"]){
                    plane.fromJSON(planeObject);
                    break;
                }
            }
        }
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
        // Remove a previous instance if present (assume only 1)
        let previousInput = null;
        for (let [planeObject, planeIndex] of this.userInputQueue){
            if (planeJSON["id"] == planeObject["id"]){
                previousInput = this.userInputQueue.pop(planeIndex);
                break;
            }
        }

        // If a previous input exists, merge it
        if (previousInput != null){
            for (let key of Object.keys(planeJSON)){
                // Merge all 0 values with non-zero values of previous input so that changes aren't overridden
                if (planeJSON[key] == 0 && previousInput[key] != 0){
                    planeJSON[key] = previousInput[key];
                }
            }
        }

        // Add new instance to the queue
        this.userInputQueue.add(planeJSON);
        this.userInputLock.unlock();
    }
}
module.exports=ServerMisson;