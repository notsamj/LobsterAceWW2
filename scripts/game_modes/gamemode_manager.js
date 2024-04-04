class GamemodeManager {
    constructor(){
        this.gamemode = null;
    }
    // TODO: Wait for main tick lock BEFORE allowing this.gamemode = 

    hasActiveGamemode(){
        return this.gamemode == null;
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

    async requestFrameBreak(){
        return await this.gamemode.getTickInProgressLock().awaitUnlock(true);
    }

    endFrameBreak(){
        if (!this.hasActiveGamemode()){ return; }
        this.gamemode.getTickInProgressLock().unlock();
    }
}