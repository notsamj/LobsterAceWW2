/*
    Class Name: Gamemode
    Description: Abstract class for a game mode
*/
class Gamemode {

    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */    
    constructor(){
        this.running = true;
        this.numTicks = 0;
        this.startTime = Date.now();
        this.lastTickTime = Date.now();
        this.tickInProgressLock = new Lock();
        this.lastTickTime = this.startTime;
    }

    /*
        Method Name: updateCamera
        Method Parameters: None
        Method Description: Ensures that the user is operating a spectator camera if dead or a plane if their plane is still alive (or respawns)
        Method Return: void
    */
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

    /*
        Method Name: getLastTickTime
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getLastTickTime(){
        return this.lastTickTime;
    }

    /*
        Method Name: getTickInProgressLock
        Method Parameters: None
        Method Description: Getter
        Method Return: Lock
    */
    getTickInProgressLock(){
        return this.tickInProgressLock;
    }

    /*
        Method Name: getStartTime
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getStartTime(){
        return this.startTime;
    }

    /*
        Method Name: getNumTicks
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getNumTicks(){
        return this.numTicks;
    }

    /*
        Method Name: correctTicks
        Method Parameters: None
        Method Description: Catches up the game mode to the expected tick
        Method Return: void
    */
    correctTicks(){
        this.numTicks = this.getExpectedTicks();
    }

    /*
        Method Name: allowingSceneTicks
        Method Parameters: None
        Method Description: Returns whether the game mode is allowing the scene to tick
        Method Return: Boolean
    */
    allowingSceneTicks(){
        return true;
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Ends the gane
        Method Return: void
    */
    end(){
        this.running = false;
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Puases the game
        Method Return: void
    */
    pause(){
        this.paused = true;
    }

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Unpauses the game and corrects the ticks to prevent many occuring in quick sucession
        Method Return: void
    */
    unpause(){
        this.correctTicks();
        this.paused = false;
    }

    /*
        Method Name: isPaused
        Method Parameters: None
        Method Description: Determines if the game is paused
        Method Return: Boolean
    */
    isPaused(){ return this.paused; }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Proxy for accessing a boolean value
        Method Return: boolean, true -> running, false -> not running
    */
    isRunning(){
        return this.running;
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Determines the expected number of ticks that have occured
        Method Return: integer
    */
    getExpectedTicks(){
        return Math.floor((Date.now() - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    /*
        Method Name: isRunningATestSession
        Method Parameters: None
        Method Description: A default method for any game mode. The default is that a game mode is not running a test sesion.
        Method Return: Boolean
    */
    isRunningATestSession(){ return false; }

    /*
        Method Name: inputAllowed
        Method Parameters: None
        Method Description: A default method for any game mode. The default is that a game mode is that input is allowed.
        Method Return: Boolean
    */
    inputAllowed(){ return true; }

    // Abstract Methods
    display(){}
    runsLocally(){}
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports = Gamemode;
}