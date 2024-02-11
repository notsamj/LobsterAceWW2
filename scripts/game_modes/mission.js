/*
    Class Name: Mission
    Description: A game mode with attackers and defenders. Attackers must destroy all buildings, defenders destroy the attacker bomber plane.
*/
class Mission extends GameMode {
    /*
        Method Name: constructor
        Method Parameters:
            missionObject:
                A JSON object with information about the mission
            userEntityType:
                The type of entity that the user is using
        Method Description: Constructor
        Method Return: Constructor
    */
	constructor(missionObject, userEntityType){
		super();
        this.userEntityType = userEntityType;
		this.missionObject = missionObject;
		this.running = true;
		this.tickManager = new SceneTickManager(Date.now(), scene, PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.allyDifficulty = menuManager.getMenuByName("missionStart").getAllyDifficulty();
        this.axisDifficulty = menuManager.getMenuByName("missionStart").getAxisDifficulty();
		this.buildings = this.createBuildings();
		this.planes = this.createPlanes(userEntityType);
        this.attackerSpawnLock = new TickLock(this.missionObject[this.getAttackerDifficulty()]["respawn_times"]["attackers"] / PROGRAM_DATA["settings"]["ms_between_ticks"], false);
        this.defenderSpawnLock = new TickLock(this.missionObject[this.getDefenderDifficulty()]["respawn_times"]["defenders"] / PROGRAM_DATA["settings"]["ms_between_ticks"], false);
		scene.setEntities(appendLists(this.planes, this.buildings));
        AfterMatchStats.reset();
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
        if (!this.isRunning()){
            return;
        }
        await this.tickManager.tick(() => {
            this.attackerSpawnLock.tick();
            this.defenderSpawnLock.tick();
            this.checkSpawn();
            this.checkForEnd();
        });
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
        Method Name: spawnPlanes
        Method Parameters:
            side:
                Attacker or defender side (String)
        Method Description: Spawns a set selection of planes for a team
        Method Return: void
    */
    spawnPlanes(side){
        let planes = this.createBotPlanes(side); // TODO: Instead of new planes recycle as many planes as you can from the list of dead ones
        let userPlane = this.findDeadUserFighterPlane();
        /*
           Respawn the user if they are a dead FIGHTER plane on the team that is currently being respawned (bombers can't respawn)
           Also a null check instead of a dead check because "findDeadUserFighterPlane"
           There are too many checks here but I like it personally I feel its more clear of what I'm looking for rather than what is strictly needed
        */
        if (userPlane != null && this.userEntityType != "freecam" && planeModelToType(this.userEntityType) != "bomber" && planeModelToAlliance(this.userEntityType) == this.missionObject[side] && userPlane.isDead()){
            userPlane.setHealth(userPlane.getStartingHealth());
            userPlane.setDead(false);
            this.setupPlanes([userPlane]);
            // User must be currently a freecam (and focused)
            let tempCamera = scene.getFocusedEntity();
            scene.setFocusedEntity(userPlane);
            tempCamera.die();
        }
        this.setupPlanes(planes);
        for (let plane of planes){
            scene.addPlane(plane);
        }
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
        HEADS_UP_DISPLAY.updateElement("Remaining Buildings", livingBuildings);
        HEADS_UP_DISPLAY.updateElement("Remaining Bombers", livingBombers);
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
        AfterMatchStats.setWinner(attackerWon ? this.missionObject["attackers"] : this.missionObject["defenders"], "won!");
        this.running = false;
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
                    planes.push(BiasedCampaignBotBomberPlane.createBiasedPlane(planeModel, scene, difficulty));
                }else if (side == "attackers"){
                    planes.push(BiasedCampaignAttackerBotFighterPlane.createBiasedPlane(planeModel, scene, difficulty));
                }else { // Defender Fighter plane
                    planes.push(BiasedCampaignDefenderBotFighterPlane.createBiasedPlane(planeModel, scene, difficulty));
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
    }

    /*
        Method Name: createPlanes
        Method Parameters:
            userEntityType:
                Type of entity that the user is. (String). E.g. "freecam" or "spitfire"
        Method Description: Creates all the planes at the start of the game
        Method Return: TODO
    */
    createPlanes(userEntityType){
    	let planes = [];
    	
        // Add user plane (or freecam) to the planes list
    	if (userEntityType == "freecam"){
    		planes.push(new SpectatorCamera(scene));
    	}else if (PROGRAM_DATA["plane_data"][userEntityType]["type"] == "Bomber"){
    		planes.push(new HumanBomberPlane(userEntityType, scene))
    	}else{ // User is fighter plane
    		planes.push(new HumanFighterPlane(userEntityType, scene))
    	}
    	scene.setFocusedEntity(planes[0]);
    	
        // Populate with bot planes

        // Save plane counts so that there is always 1 less if the user is taking one
        this.planeCounts = mergeCopyObjects(this.missionObject[this.getAttackerDifficulty()]["attacker_plane_counts"], this.missionObject[this.getDefenderDifficulty()]["defender_plane_counts"]);
        // Subtract the user plane from the number of bot planes
        if (userEntityType != "freecam"){
            this.planeCounts[userEntityType]--;
        }

        // Spawn the bot planes
        let botPlanes = this.createBotPlanes();
        planes = appendLists(planes, botPlanes);
        this.setupPlanes(planes);

        // Remove bombers from plane counts so no respawns!!!
        for (let plane of planes){
            if (plane instanceof BomberPlane){
                this.planeCounts[plane.getModel()]--;
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
            let building = new Building(nextX, width, height, hp);
            buildings.push(building);
            nextX += width + randomNumberInclusive(buildingRules["min_gap"], buildingRules["max_gap"]);
        }
        return buildings;
    }

    /*
        Method Name: updateHUD
        Method Parameters: None
        Method Description: Updates the HUD with information from the game
        Method Return: void
    */
    updateHUD(){
        let allyLock = this.attackerSpawnLock;
        let axisLock = this.defenderSpawnLock;
        if (this.missionObject["attackers"] != "Allies"){
            axisLock = this.attackerSpawnLock;
            allyLock = this.defenderSpawnLock;
        }
        HEADS_UP_DISPLAY.updateElement("Next Ally Respawn", ((allyLock.getTicksLeft() * PROGRAM_DATA["settings"]["ms_between_ticks"]) / 1000).toFixed(0));
        HEADS_UP_DISPLAY.updateElement("Next Axis Respawn", ((axisLock.getTicksLeft() * PROGRAM_DATA["settings"]["ms_between_ticks"]) / 1000).toFixed(0));
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays information about the game on the screen.
        Method Return: void
    */
    display(){
        this.updateHUD();
    	if (!this.isRunning()){
            AfterMatchStats.display();
        }
    }
}