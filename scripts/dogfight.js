// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    GameMode = require("../scripts/game_mode.js");
    FighterPlane = require("../scripts/fighter_plane.js");
    SceneTickManager = require("../scripts/scene_tick_manager.js");
    var planeModelToAlliance = require("../scripts/helper_functions.js").planeModelToAlliance;
    FILE_DATA = require("../data/data_json.js");
}
/*
    Class Name: Dogfight
    Description: The state of a dogfight
*/
class Dogfight extends GameMode {
    /*
        Method Name: constructor
        Method Parameters:
            scene:
                A Scene object related to the game mode
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(scene){
        super();
        this.scene = scene;
        this.startingEntities = [];
        this.running = false;
        this.winner = null;
        this.isATestSession = false;
        this.tickManager = new SceneTickManager(Date.now(), this.scene, FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        AfterMatchStats.reset();
    }

    /*
        Method Name: start
        Method Parameters:
            startingEntities:
                The entities to start the dogfight with
        Method Description: Starts a dogfight
        Method Return: void
    */
    start(startingEntities){
        this.startingEntities = startingEntities;
        this.isATestSession = this.isThisATestSession();
        this.running = true;
        this.tickManager.setStartTime(Date.now());
    }

    /*
        Method Name: getTickManager
        Method Parameters: None
        Method Description: Getter
        Method Return: TickManager
    */
    getTickManager(){
        return this.tickManager;
    }

    /*
        Method Name: isRunning
        Method Parameters: None
        Method Description: Proxity for accessing a boolean value
        Method Return: boolean, true -> running, false -> not running
    */
    isRunning(){
        return this.running;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (!this.isRunning()){
            return;
        }
        await this.tickManager.tick();
        this.checkForEnd();
    }

    /*
        Method Name: checkForEnd
        Method Parameters: None
        Method Description: Checks if the game is ready to end
        Method Return: void
    */
    checkForEnd(){
        let allyCount = 0;
        let axisCount = 0;
        // Loop through all the planes, count how many are alive
        for (let entity of this.startingEntities){
            if (entity instanceof FighterPlane && !entity.isDead()){
                let fighterPlane = entity;
                if (planeModelToAlliance(fighterPlane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        // Check if the game is over and act accordingly
        if ((axisCount == 0 || allyCount == 0) && !this.isATestSession){
            this.winner = axisCount != 0 ? "Axis" : "Allies";
            AfterMatchStats.setWinner(this.winner);
            this.running = false;
        }
    }

    /*
        Method Name: isThisATestSession
        Method Parameters: None
        Method Description: Determine if this is a test session (not a real fight so no end condition)
        Method Return: boolean, true -> this is determiend to be a test session, false -> this isn't detewrmined to be a test session
    */
    isThisATestSession(){
        let allyCount = 0;
        let axisCount = 0;
        for (let entity of this.startingEntities){
            if (entity instanceof FighterPlane){
                let fighterPlane = entity;
                if (planeModelToAlliance(fighterPlane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        return allyCount == 0 || axisCount == 0;
    }
}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = Dogfight;
}