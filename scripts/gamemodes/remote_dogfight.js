/*
    Class Name: RemoteDogfightClient
    Description: A client for participating in a Dogfight run by a server.
*/
class RemoteDogfight extends Gamemode {
    /*
        Method Name: constructor
        Method Parameters:
            client:
                A remote dogfight client associated with this dogfight
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(client){
        super();
        this.planes = [];
        this.gameOver = false;

        // Wait for start up to start running
        this.running = false;
        this.startUp();
    }

    /*
        Method Name: loadState
        Method Parameters: None
        Method Description: Loads a state
        Method Return: void
    */
    async loadState(state){
        if (state == null){ return; }
        // Check game end
        this.gameOver = state["game_over"];
        
        // If not running then load the end
        if (this.isGameOver()){
            this.stats.fromJSON(state["stats"]);
            return;
        }
        
        // Load sounds
        SOUND_MANAGER.fromSoundRequestList(state["sound_list"]);

        // TODO: If tickdifference is great enough then take from server!
        let tickDifference = this.numTicks - state["num_ticks"];
        let planeData = state["planes"];
        if (tickDifference < 0){

        }

        // Update plane general information
        for (let planeObject of planeData){
            let plane = scene.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
            // This is more for campaign (because no planes are added in dogfight) but whateverrrrr
            if (plane == null){
                console.log(planeObject["basic"]["id"])
                debugger;
                this.addNewPlane(planeObject);
                continue;
            }
            plane.loadImportantData(planeObject);
        }

        // Check if update is super future save and try to load if we have one
        if (tickDifference < 0){
            // Tick differnece < 0
            await this.asyncUpdateManager.put("plane_movement_data", this.numTicks, planeData);
            if (await this.asyncUpdateManager.has("plane_movement_data", this.numTicks)){
                planeData = await this.asyncUpdateManager.getValue("plane_movement_data", this.numTicks);
                await this.asyncUpdateManager.deletionProcedure(this.numTicks);
                tickDifference = 0;
            }
        }

        // Update plane movement
        if (tickDifference >= 0){
            for (let planeObject of planeData){
                let plane = scene.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
                if (plane == null){
                    continue;
                }
                plane.loadMovementIfNew(planeObject, tickDifference);
            }
        }

        // Update bullets
        scene.getTeamCombatManager().fromBulletJSON(state["bullets"]);
    }

    /*
        Method Name: addNewPlane
        Method Parameters:
            planeObject:
                A json object with information about a plane
        Method Description: Adds a new plane to the game
        Method Return: void
    */
    addNewPlane(planeObject){
        let isFighter = planeModelToType(planeObject["basic"]["plane_class"]) == "Fighter";
        let isHuman = planeObject["human"];
        let plane;
        if (isHuman && isFighter){
            plane = HumanFighterPlane.fromJSON(planeObject, scene, planeIsMe);
        }else if (isHuman){
            plane = HumanBomberPlane.fromJSON(planeObject, scene, planeIsMe);
        }else if (isFighter){
            plane = BiasedBotFighterPlane.fromJSON(planeObject, scene, false);
        }else{
            plane = BiasedDogfightBotBomberPlane.fromJSON(planeObject, scene, false);
        }
        this.scene.addPlane(plane);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays relevant information to the user
        Method Return: void
    */
    display(){
        if (this.isGameOver()){
            this.stats.display();
        }
    }

    /*
        Method Name: startUp
        Method Parameters: None
        Method Description: Prepares the game mode from a state
        Method Return: void
    */
    async startUp(){
        // Get a state from the server and await it then set start time then set up based on the server state
        let state = await this.translator.getState();
        let myID = USER_DATA["name"];
        // Add planes
        for (let planeObject of state["planes"]){
            if (planeObject["basic"]["human"]){
                let planeIsMe = planeObject["basic"]["id"] == myID;
                let plane;
                if (planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter"){
                    plane = HumanFighterPlane.fromJSON(planeObject, scene, planeIsMe);
                }else{
                    plane = HumanBomberPlane.fromJSON(planeObject, scene, planeIsMe);
                }
                if (planeIsMe){
                    this.userEntity = plane;
                }
                this.planes.push(plane);
            }else{
                let plane;
                if (planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter"){
                    plane = BiasedBotFighterPlane.fromJSON(planeObject, scene, false);
                }else{
                    plane = BiasedDogfightBotBomberPlane.fromJSON(planeObject, scene, false);
                }
                this.planes.push(plane);
            }
        }

        // Add planes to the scene
        scene.setEntities(this.planes);

        // If no user then add a freecam
        //console.log("Is user entity null?", this.userEntity)
        if (this.userEntity == null){
            let allyX = PROGRAM_DATA["dogfight_settings"]["ally_spawn_x"];
            let allyY = PROGRAM_DATA["dogfight_settings"]["ally_spawn_y"];
            let axisX = PROGRAM_DATA["dogfight_settings"]["axis_spawn_x"];
            let axisY = PROGRAM_DATA["dogfight_settings"]["axis_spawn_y"];
            let middleX = (allyX + axisX) / 2;
            let middleY = (allyY + axisY) / 2;
            this.userEntity = new SpectatorCamera(scene);
            this.userEntity.setCenterX(middleX);
            this.userEntity.setCenterY(middleY);
            scene.addEntity(this.userEntity);
        }
        scene.setFocusedEntity(this.userEntity);
        this.startTime = state["start_time"];
        this.numTicks = state["num_ticks"];
        this.running = true;
    }
}