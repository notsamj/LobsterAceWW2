class LocalClient extends ClientGamemode {
    constructor(game){
        super(game);
        this.paused = false;
    }

    isPaused(){
        return this.paused;
    }

    pause(){
        this.paused = true;
    }

    unpause(){
        this.paused = false;
        this.game.correctTicks();
    }



    async tick(){
        if (this.isPaused()){ return; }
        await this.game.tick();
    }

    /*
        Method Name: inputAllowed
        Method Parameters: None
        Method Description: Provides information that this game mode allows input from the user.
        Method Return: Boolean
    */
    inputAllowed(){ return true; }
}