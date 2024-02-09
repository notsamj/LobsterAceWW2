// TODO: This class needs comments
class Mission extends GameMode {
	constructor(missionObject, userEntityType){
		super();
        this.userEntityType = userEntityType;
		this.missionObject = missionObject;
		this.running = true;
		this.tickManager = new SceneTickManager(Date.now(), scene, FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
		this.buildings = this.createBuildings();
		this.planes = this.createPlanes(userEntityType);
        this.attackerSpawnLock = new TickLock(this.missionObject["respawn_times"]["attackers"] / FILE_DATA["constants"]["MS_BETWEEN_TICKS"], false);
        this.defenderSpawnLock = new TickLock(this.missionObject["respawn_times"]["defenders"] / FILE_DATA["constants"]["MS_BETWEEN_TICKS"], false);
		scene.setEntities(appendLists(this.planes, this.buildings));
        AfterMatchStats.reset();
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
            this.createBotPlanes("attackers");
            this.attackerSpawnLock.lock();
        }
        if (this.defenderSpawnLock.isReady()){
            this.spawnPlanes("defenders");
            this.defenderSpawnLock.lock();
        }
    }

    spawnPlanes(side){
        let planes = this.createBotPlanes(side);
        // TODO: Do the functions referenced here
        let userEntity = this.findUserEntity();
        // Respawn the user if they are a dead plane
        if (userEntity instanceof Plane && userEntity.isDead()){
            userEntity.setHealth(FILE_DATA["plane_data"][userEntity.getPlaneClass()]["health"]);
            userEntityType.setDead(false);
            planes.push(userEntity);
            this.deleteFreecam();
        }
        this.setupPlanes(planes);
        for (let plane of planes){
            scene.addPlane(plane);
        }
    }

    checkForEnd(){
    	let livingBuildings = false;
    	for (let building of this.buildings){
    		if (building.isAlive()){
    			livingBuildings = true;
    			break;
    		}
    	}

    	// If all buildings are destroyed then the attackers win
    	if (!livingBuildings){
    		this.endGame(true);
    	}

    	let livingBombers = false;
    	for (let plane of this.planes){
    		if (plane instanceof BomberPlane && plane.isAlive()){
    			livingBombers = true;
    			break;
    		}
    	}

    	// If all bombers are dead then the attacker loses
    	if (!livingBombers){
    		this.endGame(false);
    	}
    }

    endGame(attackerWon){
    	// console.log(attackerWon ? this.missionObject["attackers"] : this.missionObject["defenders"], "won!");
        AfterMatchStats.setWinner(attackerWon ? this.missionObject["attackers"] : this.missionObject["defenders"], "won!");
        this.running = false;
    }

    createBotPlanes(onlySide=null){
        let allyDifficulty = menuManager.getMenuByName("missionStart").getAllyDifficulty();
        let axisDifficulty = menuManager.getMenuByName("missionStart").getAxisDifficulty();
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
            plane.setFacingRight(facingRight);
            plane.setX(this.missionObject["start_zone"][side]["x"] + xOffset);
            plane.setY(this.missionObject["start_zone"][side]["y"] + yOffset);
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
        this.planeCounts = mergeCopyObjects(this.missionObject["attacker_plane_counts"], this.missionObject["defender_plane_counts"]);
        // Subtract the user plane from the number of bot planes
        if (userEntityType != "freecam"){
            this.planeCounts[userEntityType]--;
        }

        // Spawn the bot planes
        let botPlanes = this.createBotPlanes();
        planes = appendLists(planes, botPlanes);
        this.setupPlanes(planes);
        return planes;
    }

    createBuildings(){
        let buildingRules = this.missionObject["buildings"];
        let nextX = buildingRules["start_x"];
        let buildings = [];
        for (let i = 0; i < buildingRules["count"]; i++){
            let hp = randomNumberInclusive(buildingRules["min_health"], buildingRules["max_health"]);
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