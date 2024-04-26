const Dogfight = require("../scripts/gamemodes/dogfight.js");
const Lock = require("../scripts/general/lock.js");
const NotSamLinkedList = require("../scripts/general/notsam_linked_list.js");
const helperFunctions = require("../scripts/general/helper_functions.js");
const BiasedDogfightBotBomberPlane = require("../scripts/plane/bomber_plane/biased_dogfight_bot_bomber_plane.js");
const BiasedBotFighterPlane = require("../scripts/plane/fighter_plane/biased_bot_fighter_plane.js");

class TestDogfight extends Dogfight {
    /*
        Method Name: constructor
        Method Parameters:
            dogfightJSON:
                A json object with information on the settings of a dogfight
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(dogfightJSON){
        super();
        this.bulletPhysicsEnabled = dogfightJSON["bullet_physics_enabled"];
        this.planes = [];
        this.createPlanes(dogfightJSON);
        this.teamCombatManager.setEntities(this.planes);

        this.isATestSession = this.isThisATestSession();
    }

    /*
        Method Name: runsLocally
        Method Parameters: None
        Method Description: Determines if the Dogfight runs locally
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
        // Tick the scene
        this.teamCombatManager.tick();
        this.checkForEnd();
        this.numTicks++;
    }

    /*
        Method Name: createPlanes
        Method Parameters:
            dogfightJSON:
                A JSON object containing the settings for a dog fight
        Method Description: Creates a list of planes (this.planes) that are part of the dogfight
        Method Return: void
    */
    createPlanes(dogfightJSON){
        let allyX = PROGRAM_DATA["dogfight_settings"]["ally_spawn_x"];
        let allyY = PROGRAM_DATA["dogfight_settings"]["ally_spawn_y"];
        let axisX = PROGRAM_DATA["dogfight_settings"]["axis_spawn_x"];
        let axisY = PROGRAM_DATA["dogfight_settings"]["axis_spawn_y"];
        let allyFacingRight = allyX < axisX;

        // Add bots
        for (let [planeName, planeCount] of Object.entries(dogfightJSON["plane_counts"])){
            let allied = (helperFunctions.planeModelToAlliance(planeName) == "Allies");
            let x = allied ? allyX : axisX; 
            let y = allied ? allyY : axisY;
            let facingRight = (helperFunctions.planeModelToAlliance(planeName) == "Allies") ? allyFacingRight : !allyFacingRight;
            for (let i = 0; i < planeCount; i++){
                let aX = x + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let aY = y + helperFunctions.randomFloatBetween(-1 * PROGRAM_DATA["dogfight_settings"]["spawn_offset"], PROGRAM_DATA["dogfight_settings"]["spawn_offset"]);
                let botPlane;
                if (helperFunctions.planeModelToType(planeName) == "Fighter"){
                    botPlane = BiasedBotFighterPlane.createBiasedPlane(planeName, this, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }else{
                    botPlane = BiasedDogfightBotBomberPlane.createBiasedPlane(planeName, this, allied ? dogfightJSON["ally_difficulty"] : dogfightJSON["axis_difficulty"], true);
                }
                botPlane.setCenterX(aX);
                botPlane.setCenterY(aY);
                botPlane.setFacingRight(facingRight);
                this.planes.push(botPlane);
            }
        }
    }
}
module.exports = TestDogfight;