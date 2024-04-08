class ClientGamemode {
    constructor(game){
        this.game = game;
        this.userEntity = null;
        this.deadCamera = null;
    }

    display(){
        this.game.display();
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Provides information that this game mode is running locally. Default value is true
        Method Return: Boolean
    */
    runsLocally(){
        return true;
    }

    updateCamera(){
        let userEntity = this.game.getUserEntity();
        let deadCamera = this.game.getDeadCamera();
        let scene = this.game.getScene();
        // No need to update if user is meant to be a camera
        if (userEntity instanceof SpectatorCamera){
            return;
        }else if (userEntity.isAlive() && deadCamera == null){ // No need to do anything if following user
            return;
        }

        // if the user is dead then switch to dead camera
        if (userEntity.isDead() && this.deadCamera == null){
            deadCamera = new SpectatorCamera(this.game, userEntity.getX(), userEntity.getY());
            scene.addEntity(deadCamera);
            scene.setFocusedEntity(deadCamera);
        }else if (userEntity.isAlive() && deadCamera != null){ // More appropriate for campaign (resurrection) but whatever
            deadCamera.die(); // Kill so automatically deleted by scene
            deadCamera = null;
            scene.setFocusedEntity(this.userEntity);
        }
    }

    getScene(){
        return this.game.getScene();
    }

    getSoundManager(){
        return this.game.getSoundManager();
    }

    getStatsManager(){
        return this.game.getStatsManager();
    }

    getTeamCombatManager(){
        return this.game.getTeamCombatManager();
    }

    getNumTicks(){
        return this.game.getNumTicks();
    }

    getExpectedTicks(){
        return this.game.getExpectedTicks();
    }

    
    getLastTickTime(){
        return this.game.getLastTickTime();
    }

    isRunning(){
        return this.game.isRunning();
    }

    correctTicks(){
        this.game.correctTicks();
    }
}