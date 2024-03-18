/*
    Class Name: Dogfight
    Description: The state of a dogfight
*/
// TODO: Comment this file
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
        this.running = false;
        this.winner = null;
        this.isATestSession = false;
        this.stats = new AfterMatchStats();
        this.scene.getTeamCombatManager().setStatsManager(this.stats);
        this.tickInProgressLock = new Lock();
        this.startTime = Date.now();
        this.numTicks = 0;
        this.userEntity = null;
        this.paused = false;
    }

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
            this.stats.setWinner(this.winner);
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