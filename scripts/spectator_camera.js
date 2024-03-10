/*
    Class Name: SpectatorCamera
    Description: A subclass of Entity that acts as a camera, able to spectate planes or fly around.
*/
class SpectatorCamera extends Entity {
    /*
        Method Name: constructor
        Method Parameters:
            scene:
                Scene in which the spectator camera operates
            x:
                Starting x of the spectator camera
            y:
                Starting y of the spectator camera
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(scene, x=0, y=0){
        super(scene);
        this.x = x;
        this.y = y;
        this.followingEntity = null;
        this.followToggleLock = new Lock();
        this.leftRightLock = new TickLock(250 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.xLock = new TickLock(0);
        this.yLock = new TickLock(0);
        this.radar = new SpectatorRadar(this);
        this.radarLock = new TickLock(250 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.switchTeamLock = new Lock();
    }


    /*
        Method Name: getID
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    static getID(){
        return "freecam";
    }

    /*
        Method Name: getID
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getID(){
        return SpectatorCamera.getID();
    }

    /*
        Method Name: getDisplayID
        Method Parameters: None
        Method Description: Determines the ID to display in the HUD
        Method Return: String
    */
    getDisplayID(){
        return this.followingEntity != null ? this.followingEntity.getID() : this.getID();
    }

    /*
        Method Name: isFollowing
        Method Parameters: None
        Method Description: Determines if the camera is following an entity or flying around
        Method Return: boolean, true -> following, false -> not following
    */
    isFollowing(){
        // Check if the entity is still around
        if (this.followingEntity != null && this.followingEntity.isDead()){
            this.followingEntity = null;
            this.spectateFirstEntity();
        }
        return this.followingEntity != null;
    }

    /*
        Method Name: spectatePreviousEntity
        Method Parameters: None
        Method Description: Finds the entity to spectate in a "negative" direction
        Method Return: void
    */
    spectatePreviousEntity(){
        // If not following ANY entity then just start with one
        if (this.followingEntity == null){ this.spectateFirstEntity(); return; }

        // Otherwise determine the previous one and follow it
        let followableEntities = this.scene.getGoodToFollowEntities();
        let found = false;
        let i = followableEntities.length - 1;
        while (i >= 0){
            let entity = followableEntities[i];
            // If we found the current entity, ignore it of course. !found is so that if its 1 single element you don't get stuck looping
            if (entity.getID() == this.followingEntity.getID() && !found){
                found = true;
                if (i == 0){
                    i = followableEntities.length - 1;
                    continue;
                }
            }else if (found){
                this.followingEntity = entity;
                break;
            }
            i--;
        }
    }

    /*
        Method Name: getSpeed
        Method Parameters: None
        Method Description: For hud information, report plane speed if following one
        Method Return: float
    */
    getSpeed(){
        if (!this.isFollowing()){ return 0; }
        return this.followingEntity.getSpeed();
    }

    /*
        Method Name: getThrottle
        Method Parameters: None
        Method Description: For hud information, report plane throttle if following one
        Method Return: int
    */
    getThrottle(){
        if (!this.isFollowing()){ return 0; }
        return this.followingEntity.getThrottle();
    }

    /*
        Method Name: getHealth
        Method Parameters: None
        Method Description: For hud information, report plane health if following one
        Method Return: int
    */
    getHealth(){
        if (!this.isFollowing()){ return 0; }
        return this.followingEntity.getHealth();
    }

    /*
        Method Name: getRadar
        Method Parameters: None
        Method Description: Getter
        Method Return: Radar
    */
    getRadar(){ return this.radar; }

    /*
        Method Name: hasRadar
        Method Parameters: None
        Method Description: Provides the information that the spectator camera has a radar.
        Method Return: boolean, true -> has a radar, false -> does not have a radar
    */
    hasRadar(){ return true; }

    /*
        Method Name: spectateNextEntity
        Method Parameters: None
        Method Description: Finds the entity to spectate in a "positive" direction
        Method Return: void
    */
    spectateNextEntity(){
        // If not following ANY entity then just start with one
        if (this.followingEntity == null){ this.spectateFirstEntity(); return; }

        // Otherwise determine the next one and follow it
        let followableEntities = this.scene.getGoodToFollowEntities();
        let found = false;
        let i = 0;
        while (i < followableEntities.length){
            let entity = followableEntities[i];
            // If we found the current entity, ignore it of course. !found is so that if its 1 single element you don't get stuck looping
            if (entity.getID() == this.followingEntity.getID() && !found){
                found = true;
                if (i == followableEntities.length -1){
                    i = 0;
                    continue;
                }
            }else if (found){
                this.followingEntity = entity;
                break;
            }
            i++;
        }
    }

    /*
        Method Name: spectateFirstEntity
        Method Parameters: None
        Method Description: Finds the entity to spectate
        Method Return: void
    */
    spectateFirstEntity(){
        let followableEntities = this.scene.getGoodToFollowEntities();
        if (followableEntities.length > 0){
            let bestEntity = null;
            let bestDistance = null;
            for (let entity of followableEntities){
                let distance = this.distance(entity);
                if (bestDistance == null || distance < bestDistance){
                    bestEntity = entity;
                    bestDistance = distance;
                }
            }
            this.followingEntity = bestEntity;
        }
    }

    /*
        Method Name: switchTeams
        Method Parameters: None
        Method Description: Switch to spectating a plane from the other team
        Method Return: void
    */
    switchTeams(){
        // If not following ANY entity then just start with one
        if (this.followingEntity == null){ this.spectateFirstEntity(); return; }

        // Otherwise determine the next one and follow it
        let followableEntities = this.scene.getGoodToFollowEntities();
        let alliance = planeModelToAlliance(this.followingEntity.getModel());
        let found = false;
        let i = 0;
        while (i < followableEntities.length){
            let entity = followableEntities[i];
            if (!(entity instanceof Plane)){ continue; }
            // If we found the current entity, ignore it of course. !found is so that if its 1 single element you don't get stuck looping
            if (entity.getID() == this.followingEntity.getID() && !found){
                found = true;
                i = 0;
                continue;
            }else if (found && planeModelToAlliance(entity.getModel()) != alliance){
                this.followingEntity = entity;
                break;
            }
            i++;
        }
    }

    /*
        Method Name: checkFollowToggle
        Method Parameters: None
        Method Description: Checks if the user wants to toggle the following feature
        Method Return: void
    */
    checkFollowToggle(){
        if (keyIsDown(70) && this.followToggleLock.isReady()){
            this.followToggleLock.lock();
            if (this.followingEntity == null){
                this.spectateNextEntity();
            }else{
                this.followingEntity = null;
            }
        }else if (!keyIsDown(70) && !this.followToggleLock.isReady()){
            this.followToggleLock.unlock();
        }
    }

    /*
        Method Name: checkLeftRight
        Method Parameters: None
        Method Description: Checks if the user wants switch between entites previous or next
        Method Return: void
    */
    checkLeftRight(){
        let leftKey = keyIsDown(37);
        let rightKey = keyIsDown(39);
        let numKeysDown = 0;
        numKeysDown += leftKey ? 1 : 0;
        numKeysDown += rightKey ? 1 : 0;
        if (numKeysDown != 1 || !this.leftRightLock.isReady()){
            return;
        }

        this.leftRightLock.lock();
        if (leftKey){
            this.spectatePreviousEntity();
        }else{
            this.spectateNextEntity();
        }

    }

    /*
        Method Name: checkSwitchTeams
        Method Parameters: None
        Method Description: Check if the user wishes to switch which team to spectate
        Method Return: void
    */
    checkSwitchTeams(){
        let switchKey = USER_INPUT_MANAGER.isActivated("t");
        if (!switchKey && this.switchTeamLock.notReady()){ this.switchTeamLock.unlock(); }
        if (this.switchTeamLock.notReady() || !switchKey){ return; }
        this.switchTeamLock.lock();
        this.switchTeams();
    }

    /*
        Method Name: checkMoveX
        Method Parameters: None
        Method Description: Checks if the user wants to move the camera left or right
        Method Return: void
    */
    checkMoveX(){
        let leftKey = keyIsDown(37);
        let rightKey = keyIsDown(39);
        let numKeysDown = 0;
        numKeysDown += leftKey ? 1 : 0;
        numKeysDown += rightKey ? 1 : 0;
        if (numKeysDown == 0 || numKeysDown == 2){
            this.xVelocity = 0;
            return;
        }else if (!this.xLock.isReady()){ return; }
        this.xLock.lock();

        // Else 1 key down and ready to move
        this.xVelocity = 10 * getTickMultiplier();
        this.xVelocity *= leftKey ? -1 : 1; 
        this.x += this.xVelocity;
    }

    /*
        Method Name: checkMoveY
        Method Parameters: None
        Method Description: Checks if the user wants to move the camera up or down
        Method Return: void
    */
    checkMoveY(){
        let upKey = keyIsDown(38);
        let downKey = keyIsDown(40);
        let numKeysDown = 0;
        numKeysDown += upKey ? 1 : 0;
        numKeysDown += downKey ? 1 : 0;
        if (numKeysDown == 0 || numKeysDown == 2){
            this.yVelocity = 0;
            return;
        }else if (!this.yLock.isReady()){ return; }
        this.yLock.lock();

        // Else 1 key down and ready to move
        this.yVelocity = 10 * getTickMultiplier();
        this.yVelocity *= downKey ? -1 : 1; 
        this.y += this.yVelocity;
    }

    /*
        Method Name: updateRadar
        Method Parameters: None
        Method Description: Updates the radar if ready to update
        Method Return: void
    */
    updateRadar(){
        if (!this.radarLock.isReady()){ return; }
        this.radarLock.lock();
        this.radar.update();
    }

    // TODO: Comments
    getInterpolatedX(){
        return this.interpolatedX;
    }

    // TODO: Comments
    getInterpolatedY(){
        return this.interpolatedY;
    }

    // TODO: Comments
    calculateInterpolatedCoordinates(currentTime){
        // TODO: Clean this up
        if (activeGameMode.paused || !activeGameMode.isRunning()){
            return;
        }
        if (this.isFollowing()){
            let newPositionValues = this.followingEntity.calculateInterpolatedCoordinates(currentTime);
            this.interpolatedX = this.followingEntity.getInterpolatedX();
            this.interpolatedY = this.followingEntity.getInterpolatedY();
        }else{
            this.interpolatedX = this.x;
            this.interpolatedY = this.y;
        }
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Handles all the decisions and events in a tick
        Method Return: void
    */
    tick(){
        // Update tick locks
        this.xLock.tick();
        this.yLock.tick();
        this.leftRightLock.tick();
        this.radarLock.tick();
        this.updateRadar();
        this.checkFollowToggle();
        if (this.isFollowing()){
            this.checkSwitchTeams();
            this.checkLeftRight();
            this.x = this.followingEntity.getX();
            this.y = this.followingEntity.getY();
            return;
        }
        // else
        this.checkMoveX();
        this.checkMoveY();
    }
}