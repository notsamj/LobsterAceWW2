/*
    Class Name: RemoteMission
    Description: A client for participating in a Mission run by a server.
*/
class RemoteMission extends Gamemode {
    /*
        Method Name: constructor
        Method Parameters:
            client:
                A remote mission client associated with this mission
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(client){
        super();
        this.client = client;
        this.planes = [];
        this.gameOver = false;
        this.attackerSpawnLock = new TickLock(0, false);
        this.defenderSpawnLock = new TickLock(0, false);
        this.startUp();
    }

    /*
        Method Name: loadState
        Method Parameters: None
        Method Description: Loads a state
        Method Return: void
    */
    loadState(state){
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

        // Update Spawn Lock Timers
        this.attackerSpawnLock.setTicksLeft(state["attacker_spawn_ticks_left"]);
        this.defenderSpawnLock.setTicksLeft(state["defender_spawn_ticks_left"])

        // TODO: If tickdifference is great enough then take from server!
        let tickDifference = state["num_ticks"] - this.numTicks;
        // TODO: Put this in settings
        if (tickDifference > 10){
            this.numTicks = state["num_ticks"];
        }

        // Update planes
        for (let planeObject of state["planes"]){
            let plane = this.scene.getTeamCombatManager().getPlane(planeObject["basic"]["id"]);
            // This is more for campaign (because no planes are added in dogfight) but whateverrrrr
            if (plane == null){
                this.addNewPlane(planeObject);
                continue;
            }
            plane.fromJSON(planeObject, state["num_ticks"] - this.numTicks, tickDifference > 10);
        }

        // Update bullets
        this.getTeamCombatManager().fromBulletJSON(state["bullets"]);
        this.getTeamCombatManager().fromBuildingJSON(state["buildings"]);
        this.getTeamCombatManager().fromBombJSON(state["bombs"]);
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
        let attackerAlliance = this.missionObject["attackers"];
        let isHuman = planeObject["human"];
        let plane;
        if (isHuman && isFighter){
            plane = HumanFighterPlane.fromJSON(planeObject, this, planeIsMe);
        }else if (isHuman){
            plane = HumanBomberPlane.fromJSON(planeObject, this, planeIsMe);
        }else if (isFighter && planeModelToAlliance(planeObject["basic"]["plane_class"]) == attackerAlliance){
            plane = BiasedCampaignAttackerBotFighterPlane.fromJSON(planeObject, this, false);
        }else if (isFighter){
            plane = BiasedCampaignDefenderBotFighterPlane.fromJSON(planeObject, this, false);
        }else{
            plane = BiasedCampaignBotBomberPlane.fromJSON(planeObject, this, false);
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
        }else if (this.isRunning()){
            this.updateHUD();
        }
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


        let livingBuildings = 0;
        for (let [building, bI] of this.getTeamCombatManager().getBuildings()){
            if (building.isAlive()){
                livingBuildings++;
            }
        }

        let livingBombers = 0;
        for (let plane of this.planes){
            if (plane instanceof BomberPlane && plane.isAlive()){
                livingBombers++;
            }
        }
        HEADS_UP_DISPLAY.updateElement("Remaining Buildings", livingBuildings);
        HEADS_UP_DISPLAY.updateElement("Remaining Bombers", livingBombers);
    }

    /*
        Method Name: startUp
        Method Parameters:
            state:
                Starting state
        Method Description: Prepares the game mode from a state
        Method Return: void
    */
    startUp(state){
        // Get a state from the server and await it then set start time then set up based on the server state
        let missionObject = PROGRAM_DATA["missions"][state["mission_id"]];
        this.missionObject = missionObject;
        let attackerAlliance = missionObject["attackers"];
        let myID = USER_DATA["name"];
        // Add planes
        for (let planeObject of state["planes"]){
            if (planeObject["basic"]["human"]){
                let planeIsMe = planeObject["basic"]["id"] == myID;
                let plane;
                if (planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter"){
                    plane = HumanFighterPlane.fromJSON(planeObject, this, planeIsMe);
                }else{
                    plane = HumanBomberPlane.fromJSON(planeObject, this, planeIsMe);
                }
                if (planeIsMe){
                    this.userEntity = plane;
                }
                this.planes.push(plane);
            }else{
                let plane;
                let isFighter = planeModelToType([planeObject["basic"]["plane_class"]]) == "Fighter";
                if (isFighter && planeModelToAlliance(planeObject["basic"]["plane_class"]) == attackerAlliance){
                    plane = BiasedCampaignAttackerBotFighterPlane.fromJSON(planeObject, this, false);
                }else if (isFighter){
                    plane = BiasedCampaignDefenderBotFighterPlane.fromJSON(planeObject, this, false);
                }else{
                    plane = BiasedCampaignBotBomberPlane.fromJSON(planeObject, this, false);
                }
                this.planes.push(plane);
            }
        }

        // Add planes to the scene
        this.scene.setEntities(this.planes);

        // If no user then add a freecam
        //console.log("Is user entity null?", this.userEntity)
        if (this.userEntity == null){
            this.userEntity = new SpectatorCamera(this, (missionObject["start_zone"]["attackers"]["x"] + missionObject["start_zone"]["defenders"]["x"])/2, (missionObject["start_zone"]["attackers"]["y"] + missionObject["start_zone"]["defenders"]["y"])/2);
            this.scene.addEntity(this.userEntity);
        }
        this.scene.setFocusedEntity(this.userEntity);
        this.startTime = state["start_time"];
        this.numTicks = state["num_ticks"];
        this.running = true;
    }
}