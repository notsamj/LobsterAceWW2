// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    BomberPlane = require("./bomber_plane.js");
    BiasedBotBomberTurret = require("../../turret/biased_bot_bomber_turret.js");
}

/*
    Class Name: BiasedBotBomberPlane
    Description: An abstract subclass of the BomberPlane that is a bot with biases for its actions
*/
class BiasedBotBomberPlane extends BomberPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            gamemode:
                A gamemode object related to the bomber plane
            angle:
                The starting angle of the bomber plane (integer)
            facingRight:
                The starting orientation of the bomber plane (boolean)
            biases:
                An object containing keys and bias values
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, angle, facingRight, biases, autonomous=true){
        super(planeClass, gamemode, angle, facingRight, autonomous);
        this.biases = biases;
        this.generateGuns(biases);
        this.throttle += this.biases["throttle"];
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.startingHealth = this.health;
        this.autonomous = autonomous; 
    }

    /*
        Method Name: generateGuns
        Method Parameters: None
        Method Description: Create gun objects for the plane
        Method Return: void
    */
    generateGuns(biases){
        this.guns = [];
        for (let gunObj of PROGRAM_DATA["plane_data"][this.planeClass]["guns"]){
            this.guns.push(BiasedBotBomberTurret.create(gunObj, this.gamemode, this, biases, this.autonomous));
        }
    }

    /*
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return PROGRAM_DATA["settings"]["shoot_distance_constant"] * PROGRAM_DATA["bullet_data"]["speed"] + this.biases["max_shooting_distance_offset"];
    }

    /*
        Method Name: getEnemyList
        Method Parameters: None
        Method Description: Find all the enemies and return them
        Method Return: List
    */
    getEnemyList(){
        let planes = this.gamemode.getTeamCombatManager().getLivingPlanes();
        let enemies = [];
        for (let plane of planes){
            if (!this.onSameTeam(plane) && plane.isAlive()){
                enemies.push(plane);
            }
        }
        let me = this;
        return enemies.sort((enemy1, enemy2) => {
            let d1 = enemy1.distance(me);
            let d2 = enemy2.distance(me);
            if (d1 < d2){
                return -1;
            }else if (d1 > d2){
                return 1;
            }else{
                return 0;
            }
        });
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotBomberPlane;
}