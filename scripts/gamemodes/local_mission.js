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
        this.soundManager = SOUND_MANAGER;
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Determines the expected number of ticks that have occured. Overridden here to enable pausing.
        Method Return: integer
    */
    getExpectedTicks(){
        return this.client.getExpectedTicks();
    }

    /*
        Method Name: getScene
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: PlaneGameScene
    */
    getScene(){ return this.client.getScene(); }

    /*
        Method Name: attachToClient
        Method Parameters:
            client:
                A client object associated with this mission
        Method Description: Attaches the client and sets up the game
        Method Return: void
    */
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

    /*
        Method Name: getUserEntity
        Method Parameters: None
        Method Description: Getter
        Method Return: Entity
    */
    getUserEntity(){
        return this.userEntity;
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Checks if the gamemode is run locally, true for local dogfight
        Method Return: Boolean
    */
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