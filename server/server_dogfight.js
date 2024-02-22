const PlaneGameScene = require("../scripts/plane_game_scene.js");
const SoundManager = require("../scripts/general/sound_manager.js");
const AfterMatchStats = require("../scripts/after_match_stats.js");
const TickScheduler = require("../scripts/tick_scheduler.js");
const Lock = require("../scripts/general/lock.js");
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const helperFunctions = require("../scripts/general/helper_functions.js");

const HumanFighterPlane = require("../scripts/plane/fighter_plane/human_fighter_plane.js");
const HumanBomberPlane = require("../scripts/plane/bomber_plane/human_bomber_plane.js");
const BiasedBotBomberPlane = require("../scripts/plane/bomber_plane/biased_bot_bomber_plane.js");
const BiasedBotFighterPlane = require("../scripts/plane/fighter_plane/biased_bot_fighter_plane.js");

// TODO: This class needs comments
class ServerDogfight {
    constructor(dogFightJSON){
        this.winner = null;
        this.bulletPhysicsEnabled = dogFightJSON["bullet_physics_enabled"];
        this.isATestSession = this.isThisATestSession(dogFightJSON);
        this.numTicks = 0;

        this.soundManager = new SoundManager();
        this.stats = new AfterMatchStats();

        this.scene = new PlaneGameScene(this.soundManager);
        this.scene.enableTicks();
        this.scene.setBulletPhysicsEnabled(this.bulletPhysicsEnabled);
        this.scene.setStatsManager(this.stats);

        this.planes = [];
        this.createPlanes(dogFightJSON);
        this.scene.setEntities(this.planes);

        this.tickScheduler = new TickScheduler(() => { this.regularTick(); }, PROGRAM_DATA["settings"]["ms_between_ticks"], Date.now());
        this.tickInProgressLock = new Lock();
        this.userInputLock = new Lock();
        this.userInputQueue = new NotSamLinkedList();
        this.running = true;
        this.paused = false;
        this.lastState = this.generateState();
    }

    playerDisconnected(username){
        for (let plane of this.planes){
            if (plane.getID() == username){
                plane.die();
            }
        }
    }

    pause(){
        this.paused = true;
    }

    unpause(){
        this.paused = false;
    }

    isRunning(){
        return this.running;
    }

    end(){
        this.running = false;
        this.tickScheduler.end();
    }

    areBulletPhysicsEnabled(){
        return this.bulletPhysicsEnabled;
    }

    /*
        Method Name: regularTick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async regularTick(){
        if (this.tickInProgressLock.notReady()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        let expectedTicks = this.tickScheduler.getExpectedTicks();

        // Tick until the expected number of ticks have passed
        while (this.isRunning() && this.numTicks < expectedTicks){
            await this.gameTick();
            this.numTicks++;
        }

        // Save current state and update from user input
        this.lastState = this.generateState();
        await this.updateFromUserInput();
        this.tickInProgressLock.unlock();
    }

    async gameTick(){
        if (!this.isRunning() || this.paused){
            return;
        }
        // Tick the scene
        await this.scene.tick(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.checkForEnd();
    }

    /*
        Method Name: checkForEnd
        Method Parameters: None
        Method Description: Checks if the game is ready to end
        Method Return: void
    */
    checkForEnd(){
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
            this.stats.setWinner(this.winner);
            this.running = false;
        }
    }

    /*
        Method Name: isThisATestSession
        Method Parameters:
            dogFightJSON:
                Details about the dog fight
        Method Description: Determine if this is a test session (not a real fight so no end condition)
        Method Return: boolean, true -> this is determined to be a test session, false -> this isn't detewrmined to be a test session
    */
    isThisATestSession(dogFightJSON){
        let noAllies = true;
        let noAxis = true;
        for (let [planeModel, planeCount] of Object.entries(dogFightJSON["planeCounts"])){
            if (planeModelToAlliance(planeModel) == "Axis" && planeCount > 0){
                noAxis = false;
            }else if (planeModelToAlliance(planeModel) == "Allies" && planeCount > 0){
                noAllies = false;
            }
            // If determines its not a test session stop checking
            if (!noAxis && !noAxis){
                break;
            }
        }
        return noAxis || noAxis;
    }

    getLastState(){
        return this.lastState;
    }

    generateState(){
        let stateRep = {};
        stateRep["paused"] = this.paused;
        stateRep["num_ticks"] = this.numTicks;
        stateRep["start_time"] = this.tickScheduler.getStartTime();
        stateRep["running"] = this.isRunning();
        // Send different things if running
        if (this.isRunning()){
            // Add sound
            stateRep["sound_list"] = this.soundManager.getSoundRequestList();
            this.soundManager.clearRequests();
            // Add planes
            stateRep["planes"] = this.scene.getPlaneJSON();
            // Add bullets
            stateRep["bullets"] = this.scene.getBulletJSON();
        }else{
            // Add after match stats
            stateRep["stats"] = this.stats.toJSON();
        }
        return stateRep;
    }


    createPlanes(dogFightJSON){
        let allyX = PROGRAM_DATA["dogfight_settings"]["ally_spawn_x"];
        let allyY = PROGRAM_DATA["dogfight_settings"]["ally_spawn_y"];
        let axisX = PROGRAM_DATA["dogfight_settings"]["axis_spawn_x"];
        let axisY = PROGRAM_DATA["dogfight_settings"]["axis_spawn_y"];
        let allyFacingRight = allyX < axisX;

        // Add users
        for (let user of dogFightJSON["users"]){
            let userEntityModel = user["model"]; // Note: Expected NOT freecam
            let userPlane = helperFunctions.planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this.scene, 0, true, false) : new HumanBomberPlane(userEntityModel, this.scene, 0, true, false);
            userPlane.setCenterX(helperFunctions.planeModelToAlliance(userEntityModel) == "Allies" ? allyX : axisX);
            userPlane.setCenterY(helperFunctions.planeModelToAlliance(userEntityModel) == "Allies" ? allyY : axisY);
            userPlane.setFacingRight((helperFunctions.planeModelToAlliance(userEntityModel) == "Allies") ? allyFacingRight : !allyFacingRight);
            userPlane.setID(user["id"]);
            this.planes.push(userPlane);
        }

        // Add bots
        for (let [planeName, planeCount] of Object.entries(dogFightJSON["planeCounts"])){
            let allied = (helperFunctions.planeModelToAlliance(planeName) == "Allies");
            let x = allied ? allyX : axisX; 
            let y = allied ? allyY : axisY;
            let facingRight = (helperFunctions.planeModelToAlliance(planeName) == "Allies") ? allyFacingRight : !allyFacingRight;
            for (let i = 0; i < planeCount; i++){
                let aX = x + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let aY = y + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let botPlane;
                if (helperFunctions.planeModelToType(planeName) == "Fighter"){
                    botPlane = BiasedBotFighterPlane.createBiasedPlane(planeName, this.scene, allied ? dogFightJSON["allyDifficulty"] : dogFightJSON["axisDifficulty"], true);
                }else{
                    botPlane = BiasedBotBomberPlane.createBiasedPlane(planeName, this.scene, allied ? dogFightJSON["allyDifficulty"] : dogFightJSON["axisDifficulty"], true);
                }
                botPlane.setCenterX(aX);
                botPlane.setCenterY(aY);
                botPlane.setFacingRight(facingRight);
                this.planes.push(botPlane);
            }
        }
    }

    async updateFromUserInput(){
        if (this.paused){ return; }
        await this.userInputLock.awaitUnlock(true);
        // Update all planes based on user input
        for (let [planeObject, planeIndex] of this.userInputQueue){
            for (let plane of this.scene.getPlanes()){
                if (plane.getID() == planeObject["basic"]["id"]){
                    plane.fromJSON(planeObject);
                    break;
                }
            }
        }
        this.userInputLock.unlock();
    }

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
module.exports=ServerDogfight;