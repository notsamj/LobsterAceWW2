// Load Gamemode if run with NodeJS
if (typeof window === "undefined"){
    Gamemode = require("./gamemode.js");
}
/*
    Class Name: Dogfight
    Description: A class that runs a Dogfight
*/
class Dogfight extends Gamemode {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    async tick(){
        if (this.tickInProgressLock.notReady() || !this.isRunning() || this.numTicks >= this.getExpectedTicks()){ return; }
        this.refreshLastTickTime();
        // Update camera
        await this.tickInProgressLock.awaitUnlock(true);
        this.teamCombatManager.tick();
        this.numTicks++;
        this.checkForEnd();
        this.tickInProgressLock.unlock();
    }

    /*
        Method Name: isRunningATestSession
        Method Parameters: None
        Method Description: Provides information about whether the dogfight is just a test
        Method Return: Boolean
    */
    isRunningATestSession(){
        return this.isATestSession;
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
        for (let entity of this.planes){
            if (entity instanceof Plane && !entity.isDead()){
                let plane = entity;
                if (planeModelToAlliance(plane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        // Check if the game is over and act accordingly
        if ((axisCount == 0 || allyCount == 0) && !this.isATestSession){
            this.winner = axisCount != 0 ? "Axis" : "Allies";
            this.statsManager.setWinner(this.winner);
            this.running = false;
            this.gameOver = true;
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
        // Sometimes freecam is part of this.planes but is not a plane
        for (let entity of this.planes){
            if (entity instanceof Plane){
                let plane = entity;
                if (planeModelToAlliance(plane.getPlaneClass()) == "Axis"){
                    axisCount++;
                }else{
                    allyCount++;
                }
            }
        }
        return allyCount == 0 || axisCount == 0;
    }
}
if (typeof window === "undefined"){
    module.exports=Dogfight;
}