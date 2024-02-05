// TODO: This class needs comments
class Mission extends GameMode {
	constructor(missionObject, userEntityType){
		super();
		this.missionObject = missionObject;
		this.running = true;
		this.tickManager = new SceneTickManager(Date.now(), scene, FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
		this.buildings = this.createBuildings();
		this.planes = this.createPlanes(userEntityType);
		scene.setEntities(appendLists(this.planes, this.buildings));
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
        await this.tickManager.tick();
        this.checkForEnd();
    }

    checkForEnd(){
    	let livingBuildings = false;
    	for (let building of this.buildings){
    		if (building.isAlive()){
    			livingBuildings = true;
    			break;
    		}
    	}

    	// Temp
    	livingBuildings = true;

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

        // Temp
        livingBombers = true;

    	// If all bombers are dead then the attacker loses
    	if (!livingBombers){
    		this.endGame(false);
    	}
    }

    endGame(attackerWon){
    	console.log(this.missionObject["attackers"], "won!");
    }

    createPlanes(userEntityType){
    	let planes = [];
    	// TODO:
    	if (userEntityType == "freecam"){
    		planes.push(new SpectatorCamera(scene));
    	}else if (FILE_DATA["plane_data"][userEntityType]["type"] == "Bomber"){
    		planes.push(new HumanBomberPlane(userEntityType, scene))
    	}else{ // User is fighter plane
    		planes.push(new HumanFighterPlane(userEntityType, scene))
    	}
    	planes[0].setX(0);
    	planes[0].setY(500);
    	scene.setFocusedEntity(planes[0]);
    	return planes;
    }

    createBuildings(){
        return [new Building(5000, 100, 500, 50)];
    }

    display(){
    	// TODO stats
    }
}