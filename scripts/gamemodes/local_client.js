// Note: May be worth removing this.paused variable not needed?
class LocalClient extends ClientGamemode {
    constructor(gamemode){
        super(gamemode);
        this.paused = false;
    }

    isPaused(){
        return this.paused;
    }

    pause(){
        this.paused = true;
        this.gamemode.pause();
    }

    unpause(){
        this.paused = false;
        this.gamemode.unpause();
    }

    async tick(){
        if (this.isPaused()){ return; }
        await this.gamemode.tick();
    }
}