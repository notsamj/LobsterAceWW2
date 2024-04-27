const Mission = require("../scripts/gamemodes/mission.js");
const PROGRAM_DATA = require("../data/data_json.js");
/*
    Class Name: TestMission
    Description: Subclass of Mission meant for a mission running on a server
*/
class TestMission extends Mission {
    /*
        Method Name: constructor
        Method Parameters:
            missionSetupJSON:
                A json object with information on the settings of a dogfight
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(missionSetupJSON){
        super(PROGRAM_DATA["missions"][missionSetupJSON["mission_id"]], missionSetupJSON);
        this.bulletPhysicsEnabled = missionSetupJSON["bullet_physics_enabled"];
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Determines if the Mission runs locally
        Method Return: Boolean
    */
    runsLocally(){
        return true;
    }

    /*
        Method Name: end
        Method Parameters: None
        Method Description: Ends a game
        Method Return: void
    */
    end(){
        this.running = false;
        this.gameOver = true;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Run the actions that take place during a tick
        Method Return: void
    */
    tick(){
        this.defenderSpawnLock.tick();
        this.attackerSpawnLock.tick();

        // Tick the scene
        this.teamCombatManager.tick();
        this.checkForEnd();
        this.checkSpawn();
        this.numTicks++;
    }
}
module.exports=TestMission;