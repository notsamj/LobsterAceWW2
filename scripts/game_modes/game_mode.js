/*
    Class Name: GameMode
    Description: Abstract class for a game mode
    TODO: Comments
*/
class GameMode {
    constructor(){
        this.running = false;
        this.numTicks = 0;
        this.startTime = Date.now();
        this.tickInProgressLock = new Lock();
        this.lastTickTime = this.startTime;
    }

    getLastTickTime(){
        return this.lastTickTime;
    }

    getTickInProgressLock(){
        return this.tickInProgressLock;
    }

    getStartTime(){
        return this.startTime;
    }

    getNumTicks(){
        return this.numTicks;
    }

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

    end(){
        this.running = false;
    }

    pause(){
        this.paused = true;
    }

    unpause(){
        this.correctTicks();
        this.paused = false;
    }

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

    // TODO: Comments
    getExpectedTicks(){
        return Math.floor((Date.now() - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    isRunningATestSession(){ return false; }

    inputAllowed(){ return true; }

    // Abstract Methods
    display(){}
    runsLocally(){}
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports = GameMode;
}