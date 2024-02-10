// TODO: This class needs comments
class Mission extends GameMode {
	constructor(missionObject, userEntityType){
		super();
        this.userEntityType = userEntityType;
		this.missionObject = missionObject;
		this.running = true;
		this.tickManager = new SceneTickManager(Date.now(), scene, FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.allyDifficulty = menuManager.getMenuByName("missionStart").getAllyDifficulty();
        this.axisDifficulty = menuManager.getMenuByName("missionStart").getAxisDifficulty();
		this.buildings = this.createBuildings();
		this.planes = this.createPlanes(userEntityType);
        this.attackerSpawnLock = new TickLock(this.missionObject[this.getAttackerDifficulty()]["respawn_times"]["attackers"] / FILE_DATA["constants"]["MS_BETWEEN_TICKS"], false);
        this.defenderSpawnLock = new TickLock(this.missionObject[this.getDefenderDifficulty()]["respawn_times"]["defenders"] / FILE_DATA["constants"]["MS_BETWEEN_TICKS"], false);
		scene.setEntities(appendLists(this.planes, this.buildings));
        AfterMatchStats.reset();
	}

    getAttackerDifficulty(){
        return this.missionObject["attackers"] == "Allies" ? this.allyDifficulty : this.axisDifficulty;
    }

    getDefenderDifficulty(){
        return this.missionObject["defenders"] == "Allies" ? this.allyDifficulty : this.axisDifficulty;
    }

    getBuildings(){
        return this.buildings;
    }

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

    findDeadUserFighterPlane(){
        for (let plane of scene.getDeadPlanes()){
            if (plane instanceof HumanFighterPlane){
                return plane;
            }
        }
        return null;
    }

    spawnPlanes(side){
        let planes = this.createBotPlanes(side);
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

    endGame(attackerWon){
        AfterMatchStats.setWinner(attackerWon ? this.missionObject["attackers"] : this.missionObject["defenders"], "won!");
        this.running = false;
    }

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
                if (FILE_DATA["plane_data"][planeModel]["type"] == "Bomber"){
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
                plane.setStartingHealth(plane.getHealth() * this.missionObject[this.getAttackerDifficulty()]["BOMBER_HP_MULTIPLIER"]);
                plane.setHealth(plane.getStartingHealth());
            }
        }
    }

    createPlanes(userEntityType){
    	let planes = [];
    	
        // Add user plane (or freecam) to the planes list
    	if (userEntityType == "freecam"){
    		planes.push(new SpectatorCamera(scene));
    	}else if (FILE_DATA["plane_data"][userEntityType]["type"] == "Bomber"){
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

    updateHUD(){
        let allyLock = this.attackerSpawnLock;
        let axisLock = this.defenderSpawnLock;
        if (this.missionObject["attackers"] != "Allies"){
            axisLock = this.attackerSpawnLock;
            allyLock = this.defenderSpawnLock;
        }
        HEADS_UP_DISPLAY.updateElement("Next Ally Respawn", ((allyLock.getTicksLeft() * FILE_DATA["constants"]["MS_BETWEEN_TICKS"]) / 1000).toFixed(0));
        HEADS_UP_DISPLAY.updateElement("Next Axis Respawn", ((axisLock.getTicksLeft() * FILE_DATA["constants"]["MS_BETWEEN_TICKS"]) / 1000).toFixed(0));
    }

    display(){
        this.updateHUD();
    	if (!this.isRunning()){
            AfterMatchStats.display();
        }
    }
}