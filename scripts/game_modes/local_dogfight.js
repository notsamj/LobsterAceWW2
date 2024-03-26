/*
    Class Name: LocalDogfight
    Description: A subclass of Dogfight that is meant for only locally running dogfights
*/
class LocalDogfight extends Dogfight {
    /*
        Method Name: constructor
        Method Parameters:
            TODO: COMMENTS
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(dogfightJSON){
        super(scene);
        this.scene.setGamemode(this);
        this.scene.setBulletPhysicsEnabled(PROGRAM_DATA["settings"]["use_physics_bullets"]);
        this.planes = [];
        this.setup(dogfightJSON);
        this.scene.enable();
        this.isATestSession = this.isThisATestSession();
        this.running = true;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks() || this.isPaused()){ return; }
        this.lastTickTime = Date.now();
        // Update camera
        this.updateCamera();
        await this.tickInProgressLock.awaitUnlock(true);
        await this.scene.tick(PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.numTicks++;
        this.checkForEnd();
        this.tickInProgressLock.unlock();
    }

    // TODO: Comments
    updateCamera(){
        // No need to update if user is meant to be a camera
        if (this.userEntity instanceof SpectatorCamera){
            return;
        }else if (this.userEntity.isAlive() && this.deadCamera == null){ // No need to do anything if following user
            return;
        }

        // if the user is dead then switch to dead camera
        if (this.userEntity.isDead() && this.deadCamera == null){
            this.deadCamera = new SpectatorCamera(scene, this.userEntity.getX(), this.userEntity.getY());
            scene.addEntity(this.deadCamera);
            scene.setFocusedEntity(this.deadCamera);
        }else if (this.userEntity.isAlive() && this.deadCamera != null){ // More appropriate for campaign (resurrection) but whatever
            this.deadCamera.die(); // Kill so automatically deleted by scene
            this.deadCamera = null;
            // TODO: SCene is removing these dead entities right?
            scene.setFocusedEntity(this.userEntity);
        }
    }
    
    runsLocally(){ return true; }
    inputAllowed(){ return true; }

    // TODO: COmments
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
                    botPlane = BiasedBotFighterPlane.createBiasedPlane(planeName, this.scene, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }else{
                    botPlane = BiasedBotBomberPlane.createBiasedPlane(planeName, this.scene, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
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
            let userPlane = planeModelToType(userEntityModel) == "Fighter" ? new HumanFighterPlane(userEntityModel, this.scene, 0, true, true) : new HumanBomberPlane(userEntityModel, this.scene, 0, true, true);
            userPlane.setCenterX(planeModelToAlliance(userEntityModel) == "Allies" ? allyX : axisX);
            userPlane.setCenterY(planeModelToAlliance(userEntityModel) == "Allies" ? allyY : axisY);
            userPlane.setFacingRight((planeModelToAlliance(userEntityModel) == "Allies") ? allyFacingRight : !allyFacingRight);
            userPlane.setID(dogfightJSON["users"][0]["id"]);
            this.userEntity = userPlane;
            this.planes.push(this.userEntity);
        }else{
            let middleX = (allyX + axisX) / 2;
            let middleY = (allyY + axisY) / 2;
            this.userEntity = new SpectatorCamera(scene);
            this.userEntity.setCenterX(middleX);
            this.userEntity.setCenterY(middleY);
        }
        //scene.addPlane(this.userEntity);
        scene.setFocusedEntity(this.userEntity);

        // Add planes to the scene
        scene.setEntities(this.planes);

        // Add user entity to scene entities if its a camera
        if (this.userEntity instanceof SpectatorCamera){
            scene.addEntity(this.userEntity);
        }
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display stats if the fight is over
        Method Return: void
    */
    display(){
        if (!this.isRunning()){
            this.stats.display();
        }
    }
}