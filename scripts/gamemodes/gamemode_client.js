/*
    Class Name: GamemodeClient
    Description: A wrapper for a gamemode
*/
class GamemodeClient {
    /*
        Method Name: constructor
        Method Parameters:
            gamemode:
                A Gamemode object
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(gamemode){
        this.gamemode = gamemode;
        this.scene = new PlaneGameScene(this.gamemode, this.gamemode.getVisualEffectManager());
        this.deadCamera = null; // Used when the user is a plane but is dead so becomes a camera
        this.gamemode.attachToClient(this);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Instructs the gamemode to display
        Method Return: void
    */

    display(){
        this.gamemode.display();
    }

    /*
        Method Name: getUserEntity
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: Entity
    */
    getUserEntity(){
        return this.gamemode.getUserEntity();
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

    /*
        Method Name: updateCamera
        Method Parameters: None
        Method Description: Ensures that the focused object is either a living plane or a camera
        Method Return: void
    */
    updateCamera(){
        let userEntity = this.gamemode.getUserEntity();
        let scene = this.gamemode.getScene();
        // No need to update if user is meant to be a camera
        if (userEntity instanceof SpectatorCamera){
            return;
        }else if (userEntity.isAlive() && this.deadCamera == null){ // No need to do anything if following user
            return;
        }

        // if the user is dead then switch to dead camera
        if (userEntity.isDead() && this.deadCamera == null){
            this.deadCamera = new SpectatorCamera(this.gamemode, userEntity.getX(), userEntity.getY());
            scene.addEntity(this.deadCamera);
            scene.setFocusedEntity(this.deadCamera);
        }else if (userEntity.isAlive() && this.deadCamera != null){ // More appropriate for campaign (resurrection) but whatever
            this.deadCamera.die(); // Kill so automatically deleted by scene
            this.deadCamera = null;
            scene.setFocusedEntity(userEntity);
        }
    }

    /*
        Method Name: getScene
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: PlaneGameScene
    */
    getScene(){
        return this.scene;
    }

    /*
        Method Name: getSoundManager
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: SoundManager
    */
    getSoundManager(){
        return this.gamemode.getSoundManager();
    }

    /*
        Method Name: getStatsManager
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: AfterMatchStats
    */
    getStatsManager(){
        return this.gamemode.getStatsManager();
    }

    /*
        Method Name: getTeamCombatManager
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: TeamCombatManager
    */
    getTeamCombatManager(){
        return this.gamemode.getTeamCombatManager();
    }

    /*
        Method Name: getNumTicks
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: Integer
    */
    getNumTicks(){
        return this.gamemode.getNumTicks();
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: Integer
    */
    getExpectedTicks(){
        return this.gamemode.getExpectedTicks();
    }

    /*
        Method Name: getLastTickTime
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: Integer
    */
    getLastTickTime(){
        return this.gamemode.getLastTickTime();
    }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: Boolean
    */
    isRunning(){
        return this.gamemode.isRunning();
    }

    /*
        Method Name: correctTicks
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: void
    */
    correctTicks(){
        this.gamemode.correctTicks();
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: void
    */
    end(){
        this.gamemode.end();
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Pauses the game. Disabled by default
        Method Return: void
    */
    pause(){}

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Unpauses the game. Disabled by default
        Method Return: void
    */
    unpause(){}
}