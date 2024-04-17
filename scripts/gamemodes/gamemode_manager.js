/*
    Class Name: GamemodeManager
    Description: A tool for managing the current game mode and client
*/
class GamemodeManager {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.gamemodeClient = null;
    }

    /*
        Method Name: hasActiveGamemode
        Method Parameters: None
        Method Description: Checks if there is a gamemode running at the moment
        Method Return: Boolean
    */
    hasActiveGamemode(){
        return this.gamemodeClient != null;
    }

    /*
        Method Name: getActiveGamemode
        Method Parameters: None
        Method Description: Getter
        Method Return: GamemodeClient
    */
    getActiveGamemode(){
        return this.gamemodeClient;
    }

    /*
        Method Name: setActiveGamemode
        Method Parameters:
            newGamemodeClient:
                A new game mode client that is running a game
        Method Description: Setter
        Method Return: void
    */
    setActiveGamemode(newGamemodeClient){
        this.gamemodeClient = newGamemodeClient;
    }

    /*
        Method Name: deleteActiveGamemode
        Method Parameters: None
        Method Description: Removes the active gamemode
        Method Return: void
    */
    deleteActiveGamemode(){
        this.gamemodeClient = null;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Tells the current client to run a tick
        Method Return: void
    */
    async tick(){
        if (!this.hasActiveGamemode()){ return; }
        // Fix num ticks if running a huge defecit
        if (this.gamemodeClient.getNumTicks() < this.gamemodeClient.getExpectedTicks() - PROGRAM_DATA["settings"]["max_tick_deficit"]){ this.gamemodeClient.correctTicks(); }
        await this.gamemodeClient.tick();
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Tells the gamemode client to display
        Method Return: void
    */
    display(){
        this.gamemodeClient.display();
    }
}