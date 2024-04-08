class GamemodeManager {
    constructor(){
        this.gamemodeClient = null;
    }

    hasActiveGamemode(){
        return this.gamemodeClient != null;
    }

    getActiveGamemode(){
        return this.gamemodeClient;
    }

    setActiveGamemode(newGamemodeClient){
        this.gamemodeClient = newGamemodeClient;
    }

    deleteGamemode(){
        this.gamemodeClient = null;
    }

    async tick(){
        if (!this.hasActiveGamemode()){ return; }
        // Fix num ticks if running a huge defecit
        if (this.gamemodeClient.getNumTicks() < this.gamemodeClient.getExpectedTicks() - PROGRAM_DATA["settings"]["max_tick_deficit"]){ this.gamemodeClient.correctTicks(); }
        await this.gamemodeClient.tick();
    }

    display(){
        this.gamemodeClient.display();
    }
}