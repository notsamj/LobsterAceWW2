// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    BiasedBotFighterPlane = require("./biased_bot_fighter_plane.js");
}

/*
    Class Name: BiasedCampaignDefenderBotFighterPlane
    Description: A fighter plane that is tasked with attacking a bomber plane and its protectors
*/
class BiasedCampaignDefenderBotFighterPlane extends BiasedBotFighterPlane {
/*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            biases:
                An object containing keys and bias values
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, biases, angle=0, facingRight=true, autonomous=true){
        super(planeClass, scene, biases, angle, facingRight, autonomous);
    }

    // TODO: Comments
    static fromJSON(rep, scene){
        let planeClass = rep["basic"]["plane_class"];
        let fp = new BiasedCampaignDefenderBotFighterPlane(planeClass, scene, rep["biases"], rep["angle"], rep["facing_right"], false);
        fp.fromJSON(rep)
        return fp;
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemy != null && this.currentEnemy.isAlive() && this.distance(this.currentEnemy) <= (PROGRAM_DATA["settings"]["enemy_disregard_distance_time_constant"] + this.biases["enemy_disregard_distance_time_constant"]) * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;

        // Loop through all enemies and determine a score for being good to attack
        
        for (let enemy of enemies){
            let progress = enemy.getX();
            if (bestRecord == null || progress > bestRecord["progress"]){
                bestRecord = {
                    "enemy": enemy,
                    "progress": progress
                }
            }
        }
        
        // If none found then do nothing
        if (bestRecord == null){ return; }
        this.currentEnemy = bestRecord["enemy"];
    }

    /*
        Method Name: createBiasedPlane
        Method Parameters: 
            planeClass:
                A string representing the type of the plane
            scene:
                A scene objet related to the plane
            difficulty:
                The current difficulty setting
        Method Description: Return a new biased campaign defender plane
        Method Return: BiasedCampaignDefenderBotFighterPlane
    */
    static createBiasedPlane(planeClass, scene, difficulty){
        let biases = BiasedBotFighterPlane.createBiases(difficulty);
        return new BiasedCampaignDefenderBotFighterPlane(planeClass, scene, biases);
    }
}
// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = BiasedCampaignDefenderBotFighterPlane;
}