if (typeof window === "undefined"){
    PlaneGameScene = require("../scene/plane_game_scene.js");
    SoundManager = require("../general/sound_manager.js");
    AfterMatchStats = require("../misc/after_match_stats.js");
    TeamCombatManager = require("../misc/team_combat_manager.js");
}
/*
    Class Name: Gamemode
    Description: Abstract class for a game mode
*/
class Gamemode {

    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */    
    constructor(){
        this.running = true;
        this.gameOver = false;
        this.winner = null;
        this.numTicks = 0;
        this.startTime = Date.now();
        this.lastTickTime = Date.now();
        this.tickInProgressLock = new Lock();
        this.lastTickTime = this.startTime;

        this.scene = new PlaneGameScene(this);
        this.soundManager = new SoundManager(this);
        this.statsManager = new AfterMatchStats(this);
        this.teamCombatManager = new TeamCombatManager(PROGRAM_DATA["teams"], this);

        // Default Values subject to change
        this.bulletPhysicsEnabled = false;
    }

    areBulletPhysicsEnabled(){
        return this.bulletPhysicsEnabled;
    }

    runsLocally(){
        return false;
    }

    getScene(){
        return this.scene;
    }

    getSoundManager(){
        return this.soundManager;
    }

    getStatsManager(){
        return this.statsManager;
    }

    getTeamCombatManager(){
        return this.teamCombatManager;
    }

    /*
        Method Name: getLastTickTime
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getLastTickTime(){
        return this.lastTickTime;
    }

    /*
        Method Name: getTickInProgressLock
        Method Parameters: None
        Method Description: Getter
        Method Return: Lock
    */
    getTickInProgressLock(){
        return this.tickInProgressLock;
    }

    /*
        Method Name: getStartTime
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getStartTime(){
        return this.startTime;
    }

    /*
        Method Name: getNumTicks
        Method Parameters: None
        Method Description: Getter
        Method Return: integer
    */
    getNumTicks(){
        return this.numTicks;
    }

    /*
        Method Name: correctTicks
        Method Parameters: None
        Method Description: Catches up the game mode to the expected tick
        Method Return: void
    */
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

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Ends the gane
        Method Return: void
    */
    end(){
        this.running = false;
    }

    /*
        Method Name: pause
        Method Parameters: None
        Method Description: Puases the game
        Method Return: void
    */
    pause(){
        this.paused = true;
    }

    /*
        Method Name: unpause
        Method Parameters: None
        Method Description: Unpauses the game and corrects the ticks to prevent many occuring in quick sucession
        Method Return: void
    */
    unpause(){
        this.correctTicks();
        this.lastTickTime = Date.now();
        //this.numTicks = Math.max(0, this.numTicks-1);
        this.paused = false;
    }

    /*
        Method Name: isPaused
        Method Parameters: None
        Method Description: Determines if the game is paused
        Method Return: Boolean
    */
    isPaused(){ return this.paused; }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Checks if the game mode is running
        Method Return: boolean, true -> mission is running, false -> mission is not running
    */
    isRunning(){
        return this.running && !this.isGameOver();
    }

    // TODO: Comments
    isGameOver(){
        return this.gameOver;
    }

    /*
        Method Name: getExpectedTicks
        Method Parameters: None
        Method Description: Determines the expected number of ticks that have occured
        Method Return: integer
    */
    getExpectedTicks(){
        return Math.floor((Date.now() - this.startTime) / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    /*
        Method Name: isRunningATestSession
        Method Parameters: None
        Method Description: A default method for any game mode. The default is that a game mode is not running a test sesion.
        Method Return: Boolean
    */
    isRunningATestSession(){ return false; }

    // Abstract Methods
    display(){ throw new Error("This method is expected to be overriden by a sub-class."); }
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports = Gamemode;
}