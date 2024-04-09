class ClientGamemode {
    constructor(gamemode){
        this.gamemode = gamemode;
    }

    display(){
        this.gamemode.display();
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Provides information that this gamemode is running locally. Default value is true
        Method Return: Boolean
    */
    runsLocally(){
        return true;
    }

    updateCamera(){
        let userEntity = this.gamemode.getUserEntity();
        let deadCamera = this.gamemode.getDeadCamera();
        let scene = this.gamemode.getScene();
        // No need to update if user is meant to be a camera
        if (userEntity instanceof SpectatorCamera){
            return;
        }else if (userEntity.isAlive() && deadCamera == null){ // No need to do anything if following user
            return;
        }

        // if the user is dead then switch to dead camera
        if (userEntity.isDead() && deadCamera == null){
            deadCamera = new SpectatorCamera(this.gamemode, userEntity.getX(), userEntity.getY());
            scene.addEntity(deadCamera);
            scene.setFocusedEntity(deadCamera);
        }else if (userEntity.isAlive() && deadCamera != null){ // More appropriate for campaign (resurrection) but whatever
            deadCamera.die(); // Kill so automatically deleted by scene
            deadCamera = null;
            scene.setFocusedEntity(userEntity);
        }
    }

    getScene(){
        return this.gamemode.getScene();
    }

    getSoundManager(){
        return this.gamemode.getSoundManager();
    }

    getStatsManager(){
        return this.gamemode.getStatsManager();
    }

    getTeamCombatManager(){
        return this.gamemode.getTeamCombatManager();
    }

    getNumTicks(){
        return this.gamemode.getNumTicks();
    }

    getExpectedTicks(){
        return this.gamemode.getExpectedTicks();
    }

    
    getLastTickTime(){
        return this.gamemode.getLastTickTime();
    }

    isRunning(){
        return this.gamemode.isRunning();
    }

    correctTicks(){
        this.gamemode.correctTicks();
    }

    end(){
        this.gamemode.end();
    }
}