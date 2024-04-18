/*
    Class Name: LocalClient
    Description: A client for a locally running gamemode
*/
class LocalClient extends GamemodeClient {
    constructor(gamemode){
        super(gamemode);
        this.paused = false;
        this.timeDebt = 0;
        this.pausedTime = null;
    }

    /*
        Method Name: isPaused
        Method Parameters: None
        Method Description: Checks if the client is paused
        Method Return: Boolean
    */
    isPaused(){
        return this.paused;
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Pauses the gamemode
        Method Return: void
    */
    pause(){
        this.pausedTime = Date.now();
        this.paused = true;
    }

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Unpauses the gamemode
        Method Return: void
    */
    unpause(){
        // Switch to game automatically calls unpause whether its at the start of the game or from the pause method so need to ignore when not actually paused
        if (!this.isPaused()){ return; }
        this.timeDebt += (Date.now() - this.pausedTime);
        this.gamemode.refreshLastTickTime();
        this.gamemode.correctTicks();
        this.paused = false;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Instructs the gamemode to tick
        Method Return: void
    */
    async tick(){
        if (this.isPaused()){ return; }
        await this.gamemode.tick();
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Determines the expected number of ticks that have occured. Overridden here to enable pausing.
        Method Return: integer
    */
    getExpectedTicks(){
        return Math.floor((Date.now() - this.gamemode.getStartTime() - this.timeDebt) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }
}