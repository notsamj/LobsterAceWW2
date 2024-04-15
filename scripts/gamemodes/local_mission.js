/*
    Class Name: LocalMission
    Description: A game mode with attackers and defenders. Attackers must destroy all buildings, defenders destroy the attacker bomber plane.
*/
class LocalMission extends Mission {
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
        super(missionObject, missionSetupJSON);
        this.missionSetupJSON = missionSetupJSON;
    }

    getScene(){ return this.client.getScene(); }

    attachToClient(client){
        this.client = client;

        // Start the scene
        this.getScene().enable();
        
        // Set up the camera
        if (this.missionSetupJSON["users"].length == 0){
            let cam = new SpectatorCamera(this, (this.missionObject["start_zone"]["attackers"]["x"] + this.missionObject["start_zone"]["defenders"]["x"])/2, (this.missionObject["start_zone"]["attackers"]["y"] + this.missionObject["start_zone"]["defenders"]["y"])/2);
            this.userEntity = cam;
            this.getScene().addEntity(cam);
            this.getScene().setFocusedEntity(cam);
        }else{
            this.userEntity = this.getScene().getEntity(USER_DATA["name"]);
            this.getScene().setFocusedEntity(this.userEntity);
            this.userEntity.setAutonomous(true);
        }
    }

    getUserEntity(){
        return this.userEntity;
    }

    runsLocally(){
        return true;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks() || this.isPaused()){ return; }
        this.client.updateCamera();
        await super.tick();
        await this.getScene().tick();
    }

    /*
        Method Name: updateHUD
        Method Parameters: None
        Method Description: Updates the HUD with information from the game
        Method Return: void
        TODO: Merge this is one in remote mission client
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
        for (let building of this.buildings){
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
        Method Name: display
        Method Parameters: None
        Method Description: Displays information about the game on the screen.
        Method Return: void
    */
    display(){
        this.updateHUD();
        this.getScene().display();
        if (!this.isRunning()){
            this.statsManager.display();
        }
    }
}