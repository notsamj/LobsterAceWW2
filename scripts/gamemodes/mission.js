// If using NodeJS -> Do imports
if (typeof window === "undefined"){
    AfterMatchStats = require("../misc/after_match_stats.js");
    BomberPlane = require("../plane/bomber_plane/bomber_plane.js");
    BiasedCampaignBotBomberPlane = require("../plane/bomber_plane/biased_campaign_bot_bomber_plane.js");
    BiasedCampaignAttackerBotFighterPlane = require("../plane/fighter_plane/biased_campaign_attacker_bot_fighter_plane.js");
    BiasedCampaignDefenderBotFighterPlane = require("../plane/fighter_plane/biased_campaign_defender_bot_fighter_plane.js");
    HumanFighterPlane = require("../plane/fighter_plane/human_fighter_plane.js");
    HumanBomberPlane = require("../plane/bomber_plane/human_bomber_plane.js");
    Gamemode = require("./gamemode.js");
    Building = require("../other_entities/building.js");
    helperFunctions = require("../general/helper_functions.js");
    mergeCopyObjects = helperFunctions.mergeCopyObjects;
    appendLists = helperFunctions.appendLists;
    randomNumberInclusive = helperFunctions.randomNumberInclusive;
    planeModelToType = helperFunctions.planeModelToType;
}
/*
    Class Name: Mission
    Description: An abstract game mode with attackers and defenders. Attackers must destroy all buildings, defenders destroy the attacker bomber plane.
*/
class Mission extends Gamemode {
    /*
        Method Name: constructor
        Method Parameters:
            missionObject:
                A JSON object with information about the mission
            missionSetupJSON:
                Information about the setup of the mission. Difficulty, users
        Method Description: Constructor
        Method Return: Constructor
    */
	constructor(missionObject, missionSetupJSON){
		super();
		this.missionObject = missionObject;
        this.allyDifficulty = missionSetupJSON["ally_difficulty"];
        this.axisDifficulty = missionSetupJSON["axis_difficulty"];
		this.buildings = this.createBuildings();
		this.planes = this.createPlanes(missionSetupJSON);
        this.attackerSpawnLock = new TickLock(this.missionObject[this.getAttackerDifficulty()]["respawn_times"]["attackers"] / PROGRAM_DATA["settings"]["ms_between_ticks"], false);
        this.defenderSpawnLock = new TickLock(this.missionObject[this.getDefenderDifficulty()]["respawn_times"]["defenders"] / PROGRAM_DATA["settings"]["ms_between_ticks"], false);
		this.teamCombatManager.setEntities(appendLists(this.planes, this.buildings));
        this.bulletPhysicsEnabled = missionSetupJSON["use_physics_bullets"];
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
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks() || this.isPaused()){ return; }
        await this.tickInProgressLock.awaitUnlock(true);
        this.refreshLastTickTime();
        this.attackerSpawnLock.tick();
        this.defenderSpawnLock.tick();
        this.teamCombatManager.tick();
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
        for (let plane of this.teamCombatManager.getDeadPlanes()){
            if (plane instanceof HumanFighterPlane){
                return plane;
            }
        }
        return null;
    }

    /*
        Method Name: spawnPlanes
        Method Parameters:
            side:
                Attacker or defender side (String)
        Method Description: Spawns a set selection of planes for a team
        Method Return: void
    */
    spawnPlanes(side){
        let existingPlanes = this.teamCombatManager.getAllPlanesFromAlliance(this.getAllianceFromSide(side));
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
        if (createNewPlanes){
            let freshNewPlanes = this.createBotPlanes(side); // Planes to add if not respawning
            let i = 0;
            while (i < freshNewPlanes.length && newlyCreatedPlanesToAdd.length + numPlanesCurrentlyExisting < maxPlanes){
                let planeModel = freshNewPlanes[i].getModel();
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
            this.teamCombatManager.addPlane(plane);
        }
    }

    /*
        Method Name: getSideDifficulty
        Method Parameters:
            side:
                Either allies or axis (String)
        Method Description: Checks the difficulty of planes on a given side/team
        Method Return: String
    */
    getSideDifficulty(side){
        return side == "attackers" ? this.getAttackerDifficulty() : this.getDefenderDifficulty();
    }

    /*
        Method Name: getAllianceFromSide
        Method Parameters:
            side:
                Either allies or axis (String)
        Method Description: Checks the alliance of planes on a given side/team
        Method Return: String
    */
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
        this.statsManager.setWinner(attackerWon ? this.missionObject["attackers"] : this.missionObject["defenders"], "won!");
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
                    planes.push(BiasedCampaignBotBomberPlane.createBiasedPlane(planeModel, this, difficulty));
                }else if (side == "attackers"){
                    planes.push(BiasedCampaignAttackerBotFighterPlane.createBiasedPlane(planeModel, this, difficulty));
                }else { // Defender Fighter plane
                    planes.push(BiasedCampaignDefenderBotFighterPlane.createBiasedPlane(planeModel, this, difficulty));
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
    
    setupPlanes(planes){
        // Planes need to be placed at this point
        for (let plane of planes){
            // If not a plane, but a specator camera then spawn in between spawns
            let alliance = planeModelToAlliance(plane.getModel());
            let side = (this.missionObject["attackers"] == alliance) ? "attackers" : "defenders";
            let xOffset = randomNumberInclusive(0, this.missionObject["start_zone"]["offsets"]["x"]);
            let yOffset = randomNumberInclusive(0, this.missionObject["start_zone"]["offsets"]["y"]);
            let facingRight = side == "attackers" ? true : false;
            plane.setThrottle(plane.getStartingThrottle());
            plane.setAngle(0);
            plane.setAlive(true); // This is good for setting up previously dead planes
            plane.setThrottle(plane.getStartingThrottle());
            plane.setFacingRight(facingRight);
            plane.setX(this.missionObject["start_zone"][side]["x"] + xOffset);
            plane.setY(this.missionObject["start_zone"][side]["y"] + yOffset);
            plane.setHealth(plane.getStartingHealth());
            plane.setSpeed(plane.getMaxSpeed());
            // Give bomber extra hp
            if (plane instanceof BomberPlane){
                plane.setStartingHealth(plane.getHealth() * this.missionObject[this.getAttackerDifficulty()]["bomber_hp_multiplier"]);
                plane.setHealth(plane.getStartingHealth());
            }else{ // Fighter
                plane.getGunHeatManager().reset();
                plane.getShootLock().setTicksLeft(0);
            }
        }
    }

    /*
        Method Name: createPlanes
        Method Parameters:
            missionSetupJSON:
                Information about this specific instance of the mission
        Method Description: Creates all the planes at the start of the game
        Method Return: List of planes
    */
    createPlanes(missionSetupJSON){
        let userList = missionSetupJSON["users"];
    	let planes = [];
        // Save plane counts
    	this.planeCounts = mergeCopyObjects(this.missionObject[this.getAttackerDifficulty()]["attacker_plane_counts"], this.missionObject[this.getDefenderDifficulty()]["defender_plane_counts"]);
        
        // Add users
        for (let user of userList){
            let userEntityModel = user["model"]; // Note: Expected NOT freecam
            let userPlane = planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this, false) : new HumanBomberPlane(userEntityModel, this, 0, false);
            
            // Apply Human Buffs
            
            // Health
            userPlane.applyHealthMultiplier(missionSetupJSON["human_health_multiplier"]);
            // Damage
            userPlane.applyDamageMultiplier(missionSetupJSON["human_damage_multiplier"])

            
            userPlane.setID(user["id"]);
            planes.push(userPlane);
            this.teamCombatManager.addPlane(userPlane);
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
            let building = new Building(nextX, width, height, hp, this);
            buildings.push(building);
            nextX += width + randomNumberInclusive(buildingRules["min_gap"], buildingRules["max_gap"]);
        }
        return buildings;
    }
}
// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports=Mission;
}