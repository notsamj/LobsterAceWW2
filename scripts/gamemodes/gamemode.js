// If using NodeJS -> Load some required classes
if (typeof window === "undefined"){
    SoundManager = require("../general/sound_manager.js");
    AfterMatchStats = require("../misc/after_match_stats.js");
    TeamCombatManager = require("../misc/team_combat_manager.js");
    NSEventHandler = require("../general/ns_event_handler.js");
    VisualEffectManager = require("../misc/visual_effect_manager.js");
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
        this.refreshLastTickTime();
        this.tickInProgressLock = new Lock();
        this.lastTickTime = this.startTime;

        this.eventHandler = new NSEventHandler();
        this.soundManager = new SoundManager(this);
        this.statsManager = new AfterMatchStats(this);
        this.teamCombatManager = new TeamCombatManager(PROGRAM_DATA["teams"], this);
        this.visualEffectManager = new VisualEffectManager(this);

        // Default Values subject to change
        this.bulletPhysicsEnabled = false;

        // Some needed events
        this.eventHandler.addHandler("building_collapse", (eventDetails) => {
            let x = eventDetails["x"] + eventDetails["building_x_size"]/2;
            let y = eventDetails["building_y_size"]/2;
            this.soundManager.play("building_collapse", x, y);
        });
    }

    /*

        Method Name: refreshLastTickTime
        Method Parameters: None
        Method Description: Record a tick as occuring now
        Method Return: void
    */
    refreshLastTickTime(){
        this.lastTickTime = Date.now();
    }

    /*
        Method Name: areBulletPhysicsEnabled
        Method Parameters: None
        Method Description: Provides information about whether bullet physics are enabled in the game
        Method Return: Boolean, true -> bullet physics enabled, false -> bullet physics not enabled
    */
    areBulletPhysicsEnabled(){
        return this.bulletPhysicsEnabled;
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Checks if the gamemode is run locally, false by default
        Method Return: Boolean
    */
    runsLocally(){
        return false;
    }

    /*
        Method Name: getSoundManager
        Method Parameters: None
        Method Description: Getter
        Method Return: SoundManager
    */
    getSoundManager(){
        return this.soundManager;
    }

    /*
        Method Name: getStatsManager
        Method Parameters: None
        Method Description: Getter
        Method Return: AfterMatchStats
    */
    getStatsManager(){
        return this.statsManager;
    }

    /*
        Method Name: getTeamCombatManager
        Method Parameters: None
        Method Description: Getter
        Method Return: TeamCombatManager
    */
    getTeamCombatManager(){
        return this.teamCombatManager;
    }

    /*
        Method Name: getVisualEffectManager
        Method Parameters: None
        Method Description: Getter
        Method Return: VisualEffectManager
    */
    getVisualEffectManager(){
        return this.visualEffectManager;
    }

    /*
        Method Name: getEventHandler
        Method Parameters: None
        Method Description: Getter
        Method Return: NSEventHandler
    */
    getEventHandler(){
        return this.eventHandler;
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

    /*
        Method Name: isGameOver
        Method Parameters: None
        Method Description: Checks if the game mode has ended
        Method Return: Boolean
    */
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