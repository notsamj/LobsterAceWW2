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
            biases:
                An object containing keys and bias values
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, biases, autonomous=true){
        super(planeClass, gamemode, autonomous);
        this.biases = biases;
        this.generateGuns(biases);
        this.throttle += this.biases["throttle"];
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.startingHealth = this.health;
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
            this.guns.push(BiasedBotBomberTurret.create(gunObj, this, biases));
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

    /*
        Method Name: turnInDirection
        Method Parameters:
            angleRAD:
                The angle to turn to (angle)
        Method Description: Turn the plane in a given direction
        Method Return: void
    */
    turnInDirection(angleRAD){
        let noseAngle = this.getNoseAngle()
        let dCWRAD = calculateAngleDiffCWRAD(noseAngle, angleRAD);
        let dCCWRAD = calculateAngleDiffCCWRAD(noseAngle, angleRAD);
        let angleDiffRAD = calculateAngleDiffRAD(angleRAD, noseAngle);

        // The clockwise distance is less than the counter clockwise difference and facing right then turn clockwise 
        if (dCWRAD < dCCWRAD && this.facingRight){
            this.decisions["angle"] = -1 * Math.min(toRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"]), angleDiffRAD);
        }
        // The clockwise distance is less than the counter clockwise difference and facing left then turn counter clockwise 
        else if (dCWRAD < dCCWRAD && !this.facingRight){
            this.decisions["angle"] = 1 * Math.min(toRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"]), angleDiffRAD);
        }
        // The counter clockwise distance is less than the clockwise difference and facing right then turn counter clockwise 
        else if (dCCWRAD < dCWRAD && this.facingRight){
            this.decisions["angle"] = 1 * Math.min(toRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"]), angleDiffRAD);
        }
        // The counter clockwise distance is less than the clockwise difference and facing left then turn clockwise 
        else if (dCCWRAD < dCWRAD && !this.facingRight){
            this.decisions["angle"] = -1 * Math.min(toRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"]), angleDiffRAD);
        }
        // Otherwise just turn clockwise (Shouldn't actually be possible?)
        else{
            this.decisions["angle"] = 1 * Math.min(toRadians(PROGRAM_DATA["controls"]["max_angle_change_per_tick_bomber_plane"]), angleDiffRAD);
        }
        //console.log("Angle to enemy: %d\nAngle rn: %d\nAngle Diff CW: %d\nAngle Diff CCW:%d\nAngle Diff: %d\nAngle change: %d", toDegrees(angleRAD), toDegrees(myAngle), toDegrees(dCWRAD), toDegrees(dCCWRAD), toDegrees(angleDiffRAD), toDegrees(this.decisions["angle"]));
    }

    /*
        Method Name: executeMainDecisions
        Method Parameters: None
        Method Description: Take actions based on saved decisions
        Method Return: void
    */
    executeMainDecisions(){
        // Change facing direction
        if (this.decisions["face"] != 0){
            this.face(this.decisions["face"] == 1 ? true : false);
        }

        // Adjust angle
        if (this.decisions["angle"] != 0){
            this.adjustAngle(this.decisions["angle"]);
        }
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotBomberPlane;
}