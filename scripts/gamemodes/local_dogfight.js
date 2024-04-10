/*
    Class Name: LocalDogfight
    Description: A subclass of Dogfight that is meant for only locally running dogfights
*/
class LocalDogfight extends Dogfight {
    /*
        Method Name: constructor
        Method Parameters:
            dogfightJSON:
                A JSON object with information about a dogfight
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(dogfightJSON){
        super();
        this.userEntity = null; // Needed so it can provided to the client later
        this.bulletPhysicsEnabled = PROGRAM_DATA["settings"]["use_physics_bullets"];
        this.planes = [];
        this.setup(dogfightJSON);
        this.scene.enable();
        this.isATestSession = this.isThisATestSession();
        this.client = null; // Placeholder
    }

    setClient(client){
        this.client = client;
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
        // Update camera
        this.client.updateCamera();
        await super.tick();
    }


    /*
        Method Name: setup
        Method Parameters:
            dogfightJSON:
                Provides details about a dogfight in the JSON format
        Method Description: Adds planes to a dogfight at the start
        Method Return: void
    */
    setup(dogfightJSON){
        let allyX = PROGRAM_DATA["dogfight_settings"]["ally_spawn_x"];
        let allyY = PROGRAM_DATA["dogfight_settings"]["ally_spawn_y"];
        let axisX = PROGRAM_DATA["dogfight_settings"]["axis_spawn_x"];
        let axisY = PROGRAM_DATA["dogfight_settings"]["axis_spawn_y"];

        let allyFacingRight = allyX < axisX;

        // Add bots
        for (let [planeName, planeCount] of Object.entries(dogfightJSON["plane_counts"])){
            let allied = (planeModelToAlliance(planeName) == "Allies");
            let x = allied ? allyX : axisX; 
            let y = allied ? allyY : axisY;
            let facingRight = (planeModelToAlliance(planeName) == "Allies") ? allyFacingRight : !allyFacingRight;
            for (let i = 0; i < planeCount; i++){
                let aX = x + randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let aY = y + randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let botPlane;
                if (planeModelToType(planeName) == "Fighter"){
                    botPlane = BiasedBotFighterPlane.createBiasedPlane(planeName, this, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }else{
                    botPlane = BiasedDogfightBotBomberPlane.createBiasedPlane(planeName, this, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }
                botPlane.setCenterX(aX);
                botPlane.setCenterY(aY);
                botPlane.setFacingRight(facingRight);
                this.planes.push(botPlane);
            }
        }

        let userIsAPlane = dogfightJSON["users"].length > 0;
        // Add user if plane otherwise freecam
        if (userIsAPlane){
            let userEntityModel = dogfightJSON["users"][0]["model"]; // Note: Expected NOT freecam
            let userPlane = planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this, 0, true, true) : new HumanBomberPlane(userEntityModel, this, 0, true, true);
            userPlane.setCenterX(planeModelToAlliance(userEntityModel) == "Allies" ? allyX : axisX);
            userPlane.setCenterY(planeModelToAlliance(userEntityModel) == "Allies" ? allyY : axisY);
            userPlane.setFacingRight((planeModelToAlliance(userEntityModel) == "Allies") ? allyFacingRight : !allyFacingRight);
            userPlane.setID(dogfightJSON["users"][0]["id"]);
            this.userEntity = userPlane;
            this.planes.push(this.userEntity);
        }else{
            let middleX = (allyX + axisX) / 2;
            let middleY = (allyY + axisY) / 2;
            let cam = new SpectatorCamera(this);
            this.userEntity = cam;
            cam.setCenterX(middleX);
            cam.setCenterY(middleY);
        }
        //scene.addPlane(this.userEntity);
        this.scene.setFocusedEntity(this.userEntity);

        // Add planes to the scene
        this.scene.setEntities(this.planes);

        // Add user entity to scene entities if its a camera
        if (this.userEntity instanceof SpectatorCamera){
            this.scene.addEntity(this.userEntity);
        }
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display stats if the fight is over
        Method Return: void
    */
    display(){
        this.scene.display();
        if (!this.isRunning()){
            this.statsManager.display();
        }
    }
}