if (typeof window === "undefined"){
    AfterMatchStats = require("../after_match_stats.js");
    BomberPlane = require("../plane/bomber_plane/bomber_plane.js");
    BiasedCampaignBotBomberPlane = require("../plane/bomber_plane/biased_campaign_bot_bomber_plane.js");
    BiasedCampaignAttackerBotFighterPlane = require("../plane/fighter_plane/biased_campaign_attacker_bot_fighter_plane.js");
    BiasedCampaignDefenderBotFighterPlane = require("../plane/fighter_plane/biased_campaign_defender_bot_fighter_plane.js");
    HumanFighterPlane = require("../plane/fighter_plane/human_fighter_plane.js");
    HumanBomberPlane = require("../plane/bomber_plane/human_bomber_plane.js");
    GameMode = require("./game_mode.js");
    Building = require("../building.js");
    helperFunctions = require("../general/helper_functions.js");
    mergeCopyObjects = helperFunctions.mergeCopyObjects;
    appendLists = helperFunctions.appendLists;
    randomNumberInclusive = helperFunctions.randomNumberInclusive;
}
/*
    Class Name: Mission
    Description: An abstract game mode with attackers and defenders. Attackers must destroy all buildings, defenders destroy the attacker bomber plane.
    Note: TODO: Comments
    TODO: Make a remote mission and an abstract mission
*/
class Mission extends GameMode {
    /*
        Method Name: constructor
        Method Parameters:
            missionObject:
                A JSON object with information about the mission
            missionSetupJSON:
                Information about the setup of the mission. Difficulty, users
            scene:
                TODO
        Method Description: Constructor
        Method Return: Constructor
    */
	constructor(missionObject, missionSetupJSON, scene){
		super();
		this.missionObject = missionObject;
        this.stats = new AfterMatchStats();
        this.scene = scene;
        this.scene.getTeamCombatManager().setStatsManager(this.stats);
        this.allyDifficulty = missionSetupJSON["ally_difficulty"];
        this.axisDifficulty = missionSetupJSON["axis_difficulty"];
		this.buildings = this.createBuildings();
		this.planes = this.createPlanes(missionSetupJSON["users"]);
        this.attackerSpawnLock = new TickLock(this.missionObject[this.getAttackerDifficulty()]["respawn_times"]["attackers"] / PROGRAM_DATA["settings"]["ms_between_ticks"], false);
        this.defenderSpawnLock = new TickLock(this.missionObject[this.getDefenderDifficulty()]["respawn_times"]["defenders"] / PROGRAM_DATA["settings"]["ms_between_ticks"], false);
        this.startTime = Date.now();
        this.numTicks = 0;
        this.tickInProgressLock = new Lock();
		this.scene.setEntities(appendLists(this.planes, this.buildings));
        this.running = true;
        this.gameOver = false;
        this.scene.setBulletPhysicsEnabled(PROGRAM_DATA["settings"]["use_physics_bullets"]);
        this.scene.enableTicks();
	}

    /*
        Method Name: getAttackerDifficulty
        Method Parameters: None
        Method Description: Determine the difficulty of the attacking team
        Method Return: String
    */
    getAttackerDifficulty(){
        return this.missionObject["attackers"] == "Allies" ? this.allyDifficulty : this.axisDifficulty;
    }

    /*
        Method Name: getDefenderDifficulty
        Method Parameters: None
        Method Description: Determine the difficulty of the defending team
        Method Return: String
    */
    getDefenderDifficulty(){
        return this.missionObject["defenders"] == "Allies" ? this.allyDifficulty : this.axisDifficulty;
    }

    /*
        Method Name: getBuildings
        Method Parameters: None
        Method Description: Getter
        Method Return: List of Building
    */
    getBuildings(){
        return this.buildings;
    }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Checks if the game mode is running
        Method Return: boolean, true -> mission is running, false -> mission is not running
    */
	isRunning(){
		return this.running;
	}

	/*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks() || this.isPaused()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        this.attackerSpawnLock.tick();
        this.defenderSpawnLock.tick();
        await this.scene.tick(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.checkSpawn();
        this.checkForEnd();
        this.numTicks++;
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: checkSpawn
        Method Parameters: None
        Method Description: Checks if the each side is ready to spawn, if so, spawn their planes
        Method Return: void
    */
    checkSpawn(){
        if (this.attackerSpawnLock.isReady()){
            this.spawnPlanes("attackers");
            this.attackerSpawnLock.lock();
        }
        if (this.defenderSpawnLock.isReady()){
            this.spawnPlanes("defenders");
            this.defenderSpawnLock.lock();
        }
    }

    /*
        Method Name: findDeadUserFighterPlane
        Method Parameters: None
        Method Description: Finds the user's fighter plane if it exists and its dead
        Method Return: FighterPlane
    */
    findDeadUserFighterPlane(){
        for (let plane of scene.getDeadPlanes()){
            if (plane instanceof HumanFighterPlane){
                return plane;
            }
        }
        return null;
    }

    /*
    spawnPlanes(side){
        let planes = this.createBotPlanes(side); // TODO: Instead of new planes recycle as many planes as you can from the list of dead ones
        let userPlane = this.findDeadUserFighterPlane();
        
           //Respawn the user if they are a dead FIGHTER plane on the team that is currently being respawned (bombers can't respawn)
           //Also a null check instead of a dead check because "findDeadUserFighterPlane"
           //There are too many checks here but I like it personally I feel its more clear of what I'm looking for rather than what is strictly needed
        
        if (userPlane != null && this.userEntityType != "freecam" && planeModelToType(this.userEntityType) != "bomber" && planeModelToAlliance(this.userEntityType) == this.missionObject[side] && userPlane.isDead()){
            userPlane.setHealth(userPlane.getStartingHealth());
            userPlane.setDead(false);
            this.setupPlanes([userPlane]);
            // User must be currently a freecam (and focused)
            let tempCamera = this.scene.getFocusedEntity();
            this.scene.setFocusedEntity(userPlane);
            tempCamera.die();
        }
        this.setupPlanes(planes);
        for (let plane of planes){
            this.scene.addPlane(plane);
        }
    }*/

    /*
        Method Name: spawnPlanes
        Method Parameters:
            side:
                Attacker or defender side (String)
        Method Description: Spawns a set selection of planes for a team
        Method Return: void
    */
    spawnPlanes(side){
        let existingPlanes = this.scene.getTeamCombatManager().getAllPlanesFromAlliance(this.getAllianceFromSide(side));
        let countsToSpawn = copyObject(this.planeCounts);
        let planesToSetup = [];

        // Try to respawn users
        for (let [existingPlane, pI] of existingPlanes){
            if (existingPlane.isAlive()){ continue; }
            if (!(existingPlane instanceof HumanFighterPlane)){ continue; }
            let planeModel = existingPlane.getModel();
            if (countsToSpawn[planeModel] == 0){ continue; }
            countsToSpawn[planeModel]--;
            planesToSetup.push(existingPlane);
        }

        // Try to non-users
        for (let [existingPlane, pI] of existingPlanes){
            if (existingPlane.isAlive()){ continue; }
            if (existingPlane instanceof HumanFighterPlane){ continue; }
            let planeModel = existingPlane.getModel();
            if (countsToSpawn[planeModel] == 0){ continue; }
            countsToSpawn[planeModel]--;
            planesToSetup.push(existingPlane);
        }

        // Check if still need to add more planes
        let createNewPlanes = false;
        for (let key of Object.keys(countsToSpawn)){
            if (countsToSpawn[key] > 0){
                createNewPlanes = true;
                break;
            }
        }

        let maxPlanes = this.missionObject[this.getSideDifficulty(side)]["max_planes"];
        let numPlanesCurrentlyExisting = existingPlanes.getLength();
        // Do not create new planes if at limit
        if (numPlanesCurrentlyExisting == maxPlanes){
            createNewPlanes = false;
        }

        // If we are creating new planes
        let newlyCreatedPlanesToAdd = [];
        //console.log(side, createNewPlanes)
        if (createNewPlanes){
            let freshNewPlanes = this.createBotPlanes(side); // Planes to add if not respawning
            let i = 0;
            //console.log(i , freshNewPlanes.length , newlyCreatedPlanesToAdd.length + numPlanesCurrentlyExisting , maxPlanes)
            while (i < freshNewPlanes.length && newlyCreatedPlanesToAdd.length + numPlanesCurrentlyExisting < maxPlanes){
                let planeModel = freshNewPlanes[i].getModel();
                //console.log(planeModel, countsToSpawn[planeModel])
                // If we need this plane thne add to the list
                if (countsToSpawn[planeModel] > 0){
                    newlyCreatedPlanesToAdd.push(freshNewPlanes[i]);
                    countsToSpawn[planeModel]--;
                }
                i++;
            }
        }

        // Add newly created planes to the list of planes to setup and set all up
        planesToSetup = appendLists(planesToSetup, newlyCreatedPlanesToAdd);
        this.setupPlanes(planesToSetup);

        // Add newly created planes to the scene
        for (let plane of newlyCreatedPlanesToAdd){
            //console.log("adding", plane)
            this.scene.addPlane(plane);
        }
    }

    // TODO: Comments
    getSideDifficulty(side){
        return side == this.missionObject["attackers"] ? this.getAttackerDifficulty() : this.getDefenderDifficulty();
    }

    // TODO: Comments
    getAllianceFromSide(side){
        return this.missionObject[side];
    }

    /*
        Method Name: checkForEnd
        Method Parameters: None
        Method Description: Checks if the conditions to end the game are met
        Method Return: void
    */
    checkForEnd(){
    	let livingBuildings = 0;
    	for (let building of this.buildings){
    		if (building.isAlive()){
    			livingBuildings++;
    		}
    	}
    	// If all buildings are destroyed then the attackers win
    	if (livingBuildings == 0){
    		this.endGame(true);
    	}

    	let livingBombers = 0;
    	for (let plane of this.planes){
    		if (plane instanceof BomberPlane && plane.isAlive()){
    			livingBombers++;
    		}
    	}

    	// If all bombers are dead then the attacker loses
    	if (livingBombers == 0){
    		this.endGame(false);
    	}
    }

    /*
        Method Name: endGame
        Method Parameters:
            attackerWon:
                Boolean, indicates if attackers or defenders won the game
        Method Description: Sets the winner and ends the game
        Method Return: void
    */
    endGame(attackerWon){
        this.stats.setWinner(attackerWon ? this.missionObject["attackers"] : this.missionObject["defenders"], "won!");
        this.running = false;
        this.gameOver = true;
    }

    /*
        Method Name: createBotPlanes
        Method Parameters:
            onlySide:
                Attackers or defenders (String) if only creating planes for this team. If null then both sides get planes.
        Method Description: Creates a set of bot planes.
        Method Return: List of Plane
    */
    createBotPlanes(onlySide=null){
        let allyDifficulty = this.allyDifficulty;
        let axisDifficulty = this.axisDifficulty;
        let planes = [];
        for (let planeModel of Object.keys(this.planeCounts)){
            let alliance = planeModelToAlliance(planeModel);
            let side = (this.missionObject["attackers"] == alliance) ? "attackers" : "defenders";
            if (onlySide != null && side != onlySide){ continue; }
            let count = this.planeCounts[planeModel];
            let difficulty = alliance == "Allies" ? allyDifficulty : axisDifficulty;
            for (let i = 0; i < count; i++){
                if (PROGRAM_DATA["plane_data"][planeModel]["type"] == "Bomber"){
                    planes.push(BiasedCampaignBotBomberPlane.createBiasedPlane(planeModel, this.scene, difficulty));
                }else if (side == "attackers"){
                    planes.push(BiasedCampaignAttackerBotFighterPlane.createBiasedPlane(planeModel, this.scene, difficulty));
                }else { // Defender Fighter plane
                    planes.push(BiasedCampaignDefenderBotFighterPlane.createBiasedPlane(planeModel, this.scene, difficulty));
                }
            }
        }
        return planes;
    }

    /*
        Method Name: setupPlanes
        Method Parameters:
            planes:
                List of planes to "set up"
        Method Description: Sets up attributes for a list of planes
        Method Return: void
    */
    /*
    setupPlanes(planes){
        // Planes need to be placed at this point
        for (let entity of planes){
            // If not a plane, but a specator camera then spawn in between spawns
            if (entity instanceof SpectatorCamera){
                let cam = entity;
                cam.setX((this.missionObject["start_zone"]["attackers"]["x"] + this.missionObject["start_zone"]["defenders"]["x"])/2);
                cam.setY((this.missionObject["start_zone"]["attackers"]["y"] + this.missionObject["start_zone"]["defenders"]["y"])/2);
                continue;
            }
            let plane = entity;
            let alliance = planeModelToAlliance(plane.getModel());
            let side = (this.missionObject["attackers"] == alliance) ? "attackers" : "defenders";
            let xOffset = randomNumberInclusive(0, this.missionObject["start_zone"]["offsets"]["x"]);
            let yOffset = randomNumberInclusive(0, this.missionObject["start_zone"]["offsets"]["y"]);
            let facingRight = side == "attackers" ? true : false;
            plane.setAngle(0);
            plane.setFacingRight(facingRight);
            plane.setX(this.missionObject["start_zone"][side]["x"] + xOffset);
            plane.setY(this.missionObject["start_zone"][side]["y"] + yOffset);
            // Give bomber extra hp
            if (plane instanceof BomberPlane){
                plane.setStartingHealth(plane.getHealth() * this.missionObject[this.getAttackerDifficulty()]["bomber_hp_multiplier"]);
                plane.setHealth(plane.getStartingHealth());
            }
        }
    }*/

    /*
        Method Name: setupPlanes
        Method Parameters:
            planes:
                List of planes to "set up"
        Method Description: Sets up attributes for a list of planes
        Method Return: void
    */
    
    setupPlanes(planes){
        // Planes need to be placed at this point
        for (let entity of planes){
            // If not a plane, but a specator camera then spawn in between spawns
            let plane = entity;
            let alliance = planeModelToAlliance(plane.getModel());
            let side = (this.missionObject["attackers"] == alliance) ? "attackers" : "defenders";
            let xOffset = randomNumberInclusive(0, this.missionObject["start_zone"]["offsets"]["x"]);
            let yOffset = randomNumberInclusive(0, this.missionObject["start_zone"]["offsets"]["y"]);
            let facingRight = side == "attackers" ? true : false;
            plane.setAngle(0);
            plane.setAlive(true); // This is good for setting up previously dead planes
            plane.increaseModCount(); // This is good so that clients will take the new position immediately
            plane.setFacingRight(facingRight);
            plane.setX(this.missionObject["start_zone"][side]["x"] + xOffset);
            plane.setY(this.missionObject["start_zone"][side]["y"] + yOffset);
            plane.setHealth(plane.getStartingHealth());
            // Give bomber extra hp
            if (plane instanceof BomberPlane){
                plane.setStartingHealth(plane.getHealth() * this.missionObject[this.getAttackerDifficulty()]["bomber_hp_multiplier"]);
                plane.setHealth(plane.getStartingHealth());
            }
        }
    }

    /*
        Method Name: createPlanes
        Method Parameters:
            userList:
                List of users and their planes
        Method Description: Creates all the planes at the start of the game
        Method Return: TODO
    */
    createPlanes(userList){
    	let planes = [];
        // Save plane counts
    	this.planeCounts = mergeCopyObjects(this.missionObject[this.getAttackerDifficulty()]["attacker_plane_counts"], this.missionObject[this.getDefenderDifficulty()]["defender_plane_counts"]);
        
        // Add users
        for (let user of userList){
            let userEntityModel = user["model"]; // Note: Expected NOT freecam
            let userPlane = planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this.scene, 0, true, false) : new HumanBomberPlane(userEntityModel, this.scene, 0, true, false);
            userPlane.setID(user["id"]);
            planes.push(userPlane);
            this.scene.addPlane(userPlane);
            if (this.planeCounts[userEntityModel] == 0){ continue; }
            this.planeCounts[userEntityModel]--;
        }
    	
        // Populate with bot planes
        // Spawn the bot planes
        let botPlanes = this.createBotPlanes();
        planes = appendLists(planes, botPlanes);
        this.setupPlanes(planes);

        // Remove bombers from plane counts so no respawns!!!
        for (let plane of planes){
            if (plane instanceof BomberPlane){
                let planeModel = plane.getModel();
                if (this.planeCounts[planeModel] == 0){ continue; }
                this.planeCounts[planeModel]--;
            }
        }

        return planes;
    }

    /*
        Method Name: createBuildings
        Method Parameters: None
        Method Description: Creates buildings based on specifications in the file
        Method Return: List of Building
    */
    createBuildings(){
        let buildingRules = this.missionObject["buildings"];
        let difficultyBuildingRules = this.missionObject[this.getAttackerDifficulty()]["buildings"];
        let nextX = buildingRules["start_x"];
        let buildings = [];
        for (let i = 0; i < difficultyBuildingRules["count"]; i++){
            let hp = randomNumberInclusive(difficultyBuildingRules["min_health"], difficultyBuildingRules["max_health"]);
            let width = randomNumberInclusive(buildingRules["min_width"], buildingRules["max_width"]);
            let height = randomNumberInclusive(buildingRules["min_height"], buildingRules["max_height"]);
            let building = new Building(nextX, width, height, hp, this.scene);
            buildings.push(building);
            nextX += width + randomNumberInclusive(buildingRules["min_gap"], buildingRules["max_gap"]);
        }
        return buildings;
    }
}
if (typeof window === "undefined"){
    module.exports=Mission;
}