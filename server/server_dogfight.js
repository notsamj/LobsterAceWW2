const Dogfight = require("../scripts/gamemodes/dogfight.js");
const TickScheduler = require("../scripts/misc/tick_scheduler.js");
const Lock = require("../scripts/general/lock.js");
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const helperFunctions = require("../scripts/general/helper_functions.js");

const HumanFighterPlane = require("../scripts/plane/fighter_plane/human_fighter_plane.js");
const HumanBomberPlane = require("../scripts/plane/bomber_plane/human_bomber_plane.js");
const BiasedDogfightBotBomberPlane = require("../scripts/plane/bomber_plane/biased_dogfight_bot_bomber_plane.js");
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
            gameHandler:
                A gamehandler object
            serverObject:
                A WW2PGServer object
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
        this.teamCombatManager.setEntities(this.planes);

        this.tickScheduler = new TickScheduler(async () => { await this.tick(); }, PROGRAM_DATA["settings"]["ms_between_ticks"] / 2, Date.now());
        this.userInputLock = new Lock();
        this.isATestSession = this.isThisATestSession();
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

        // Tick the scene
        await this.teamCombatManager.tick();
        this.checkForEnd();
        this.numTicks++;

        // Save current state and update from user input
        await this.updateFromUserInput();
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
            let userPlane = helperFunctions.planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this, false) : new HumanBomberPlane(userEntityModel, this, false);
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
module.exports=ServerDogfight;