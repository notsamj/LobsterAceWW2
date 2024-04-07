class GamemodeManager {
    constructor(){
        this.gamemode = null;
    }
    // TODO: Put sound manager, everything here and provide to each gamemode a list?

    hasActiveGamemode(){
        return this.gamemode != null;
    }

    getActiveGamemode(){
        return this.gamemode;
    }

    setActiveGamemode(newGamemode){
        this.gamemode = newGamemode;
    }

    deleteGamemode(){
        this.gamemode = null;
    }

    async tick(){
        if (!this.hasActiveGamemode()){ return; }
        // Fix num ticks if running a huge defecit
        if (this.gamemode.getNumTicks() < this.gamemode.getExpectedTicks() - PROGRAM_DATA["settings"]["max_tick_deficit"]){ this.gamemode.correctTicks(); }
        await this.gamemode.tick();
    }

    display(){
        this.gamemode.display();
    }
}