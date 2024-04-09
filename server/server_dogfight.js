const PlaneGameScene = require("../scripts/scene/plane_game_scene.js");
const Dogfight = require("../scripts/gamemodes/dogfight.js");
const SoundManager = require("../scripts/general/sound_manager.js");
const AfterMatchStats = require("../scripts/misc/after_match_stats.js");
const TickScheduler = require("../scripts/misc/tick_scheduler.js");
const Lock = require("../scripts/general/lock.js");
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const helperFunctions = require("../scripts/general/helper_functions.js");

const HumanFighterPlane = require("../scripts/plane/fighter_plane/human_fighter_plane.js");
const HumanBomberPlane = require("../scripts/plane/bomber_plane/human_bomber_plane.js");
const BiasedDogfightBotBomberPlane = require("../scripts/plane/bomber_plane/biased_bot_bomber_plane.js");
const BiasedBotFighterPlane = require("../scripts/plane/fighter_plane/biased_bot_fighter_plane.js");

const AsyncUpdateManager = require("../scripts/general/async_update_manager.js");

/*
    Class Name: ServerDogfight
    Description: A dogfight that is run by a server with connected clients.
*/
class ServerDogfight extends Dogfight {
    /*
        Method Name: constructor
        Method Parameters:
            dogfightJSON:
                A json object with information on the settings of a dogfight
            TODO
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(dogfightJSON, gameHandler, serverObject){
        super();
        this.serverObject = serverObject;
        this.gameHandler = gameHandler;
        this.bulletPhysicsEnabled = dogfightJSON["bullet_physics_enabled"];
        this.planes = [];
        this.createPlanes(dogfightJSON);
        this.scene.setEntities(this.planes);

        this.tickScheduler = new TickScheduler(async () => { await this.tick(); }, PROGRAM_DATA["settings"]["ms_between_ticks"] / 2, Date.now());
        this.tickInProgressLock = new Lock();
        this.userInputLock = new Lock();
        this.userInputQueue = new NotSamLinkedList();
        this.isATestSession = this.isThisATestSession();
        this.lastState = this.generateState();

        this.asyncUpdateManager = new AsyncUpdateManager();
    }

    runsLocally(){
        return true;
    }

    // TODO: Comments
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

        // Tick the scene
        await this.scene.tick();
        this.checkForEnd();
        this.numTicks++;

        // Save current state and update from user input
        this.lastState = this.generateState();
        await this.updateFromUserInput();
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: checkForEnd
        Method Parameters: None
        Method Description: Checks if the game is ready to end
        Method Return: void
    */
    /*checkForEnd(){
        let allyCount = 0;
        let axisCount = 0;
        // Loop through all the planes, count how many are alive
        for (let entity of this.planes){
            if (entity instanceof Plane && !entity.isDead()){
                let plane = entity;
                if (planeModelToAlliance(plane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        // Check if the game is over and act accordingly
        if ((axisCount == 0 || allyCount == 0) && !this.isATestSession){
            this.winner = axisCount != 0 ? "Axis" : "Allies";
            this.statsManager.setWinner(this.winner);
            this.end();
        }
    }*/

    /*
        Method Name: isThisATestSession
        Method Parameters:
            dogfightJSON:
                Details about the dog fight
        Method Description: Determine if this is a test session (not a real fight so no end condition)
        Method Return: boolean, true -> this is determined to be a test session, false -> this isn't detewrmined to be a test session
    */
    /*
    isThisATestSession(dogfightJSON){
        let noAllies = true;
        let noAxis = true;
        // Check humans
        for (let userObject of dogfightJSON["users"]){
            let planeModel = userObject["model"];
            if (planeModel == "freecam"){ return; }
            if (planeModelToAlliance(planeModel) == "Axis"){
                noAxis = false;
            }else if (planeModelToAlliance(planeModel) == "Allies"){
                noAllies = false;
            }
            // If determines its not a test session stop checking
            if (!(noAxis || noAllies)){
                break;
            }
        }
        // If there are both allies and axis then return false
        if (!(noAxis || noAllies)){
            return false;
        }
        // Check bots
        for (let [planeModel, planeCount] of Object.entries(dogfightJSON["plane_counts"])){
            if (planeModelToAlliance(planeModel) == "Axis" && planeCount > 0){
                noAxis = false;
            }else if (planeModelToAlliance(planeModel) == "Allies" && planeCount > 0){
                noAllies = false;
            }
            // If determines its not a test session stop checking
            if (!noAxis && !noAllies){
                break;
            }
        }
        return noAxis || noAllies;
    }*?

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
        }else{
            // Add after match stats
            stateRep["stats"] = this.statsManager.toJSON();
        }
        // Send out specicially the positions
        this.serverObject.sendAllWithCondition({"mail_box": "plane_movement_update", "planes": stateRep["planes"], "num_ticks": this.numTicks}, (client) => {
            return client.getState() == PROGRAM_DATA["client_states"]["in_game"];
        });
        return stateRep;
    }

    /*
        Method Name: createPlanes
        Method Parameters:
            dogfightJSON:
                A JSON object containing the settings for a dog fight
        Method Description: Creates a list of planes (this.planes) that are part of the dogfight
        Method Return: void
    */
    createPlanes(dogfightJSON){
        let allyX = PROGRAM_DATA["dogfight_settings"]["ally_spawn_x"];
        let allyY = PROGRAM_DATA["dogfight_settings"]["ally_spawn_y"];
        let axisX = PROGRAM_DATA["dogfight_settings"]["axis_spawn_x"];
        let axisY = PROGRAM_DATA["dogfight_settings"]["axis_spawn_y"];
        let allyFacingRight = allyX < axisX;

        // Add users
        for (let user of dogfightJSON["users"]){
            let userEntityModel = user["model"]; // Note: Expected NOT freecam
            let userPlane = helperFunctions.planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this, 0, true, false) : new HumanBomberPlane(userEntityModel, this, 0, true, false);
            userPlane.setCenterX(helperFunctions.planeModelToAlliance(userEntityModel) == "Allies" ? allyX : axisX);
            userPlane.setCenterY(helperFunctions.planeModelToAlliance(userEntityModel) == "Allies" ? allyY : axisY);
            userPlane.setFacingRight((helperFunctions.planeModelToAlliance(userEntityModel) == "Allies") ? allyFacingRight : !allyFacingRight);
            userPlane.setID(user["id"]);
            this.planes.push(userPlane);
        }

        // Add bots
        for (let [planeName, planeCount] of Object.entries(dogfightJSON["plane_counts"])){
            let allied = (helperFunctions.planeModelToAlliance(planeName) == "Allies");
            let x = allied ? allyX : axisX; 
            let y = allied ? allyY : axisY;
            let facingRight = (helperFunctions.planeModelToAlliance(planeName) == "Allies") ? allyFacingRight : !allyFacingRight;
            for (let i = 0; i < planeCount; i++){
                let aX = x + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let aY = y + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let botPlane;
                if (helperFunctions.planeModelToType(planeName) == "Fighter"){
                    botPlane = BiasedBotFighterPlane.createBiasedPlane(planeName, this, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }else{
                    botPlane = BiasedDogfightBotBomberPlane.createBiasedPlane(planeName, this, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }
                botPlane.setCenterX(aX);
                botPlane.setCenterY(aY);
                botPlane.setFacingRight(facingRight);
                this.planes.push(botPlane);
            }
        }
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
        for (let plane of this.teamCombatManager.getLivingPlanes()){
            let planeID = plane.getID();
            let latestPlaneUpdate = await this.asyncUpdateManager.getLastUpTo(planeID, this.numTicks);
            if (latestPlaneUpdate == null){ continue; }
            let tickDifference = this.numTicks - latestPlaneUpdate["num_ticks"];
            // Note: tickDifference MUST be >= 0 because of how the update was obtained
            plane.loadImportantData(latestPlaneUpdate);
            plane.loadImportantDecisions(latestPlaneUpdate);
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
        // TODO: this.sendAll
        this.userInputLock.unlock();
    }
}
module.exports=ServerDogfight;