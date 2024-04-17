/*
    Class Name: LocalClient
    Description: A client for a locally running gamemode
*/
class LocalClient extends GamemodeClient {
    constructor(gamemode){
        super(gamemode);
        this.paused = false;
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
        this.paused = true;
    }

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Unpauses the gamemode
        Method Return: void
    */
    unpause(){
        this.paused = false;
        this.gamemode.correctTicks();
        this.gamemode.refreshLastTickTime();
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
}