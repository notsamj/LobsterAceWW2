/*
    Class Name: GameMode
    Description: Abstract class for a game mode
    TODO: Comments
*/
class GameMode {
    constructor(){
        this.running = false;
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
        this.numTicks = this.getExpectedTicks();
        this.paused = false;
    }

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


    // Abstract Methods
    display(){}
    inputAllowed(){}
    runsLocally(){}
    isPaused(){ return false; }
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports = GameMode;
}