// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../data/data_json.js");
    TickLock = require("../general/tick_lock.js");
    BotBomberTurret = require("./bot_bomber_turret.js");
    helperFunctions = require("../general/helper_functions.js");
    fixRadians = helperFunctions.fixRadians;
}
/*
    Class Name: BiasedBotBomberTurret
    Description: A subclass of the BotBomberTurret with biases for its actions
*/
class BiasedBotBomberTurret extends BotBomberTurret {
    /*
        Method Name: constructor
        Method Parameters:
            xOffset:
                The x offset of the turret from the center of the attached plane
            yOfset:
                The y offset of the turret from the center of the attached plane
            fov1:
                An angle (degrees) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (degrees) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            plane:
                The bomber plane which the turret is attached to
            biases:
                An object containing keys and bias values
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, plane, biases){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, plane);
        this.biases = biases;
        this.shootCD = new TickLock(this.shootCD.getCooldown() * this.biases["rate_of_fire_multiplier"]);
    }

    /*
        Method Name: create
        Method Parameters:
            gunObject:
                A JSON object containing information about the turret
            plane:
                The bomber plane which the turret is attached to
            biases:
                An object containing keys and bias values
        Method Description: Creates an instance of a biased bot bomber turret and returns it
        Method Return: BiasedBotBomberTurret
    */
    static create(gunObject, plane, biases){
        return new BiasedBotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], toRadians(gunObject["fov_1"]), toRadians(gunObject["fov_2"]), gunObject["rate_of_fire"], plane, biases);
    }

    /*
        Method Name: checkShoot
        Method Parameters:
            enemyList:
                A list of enemy planes
        Method Description: Checks if the turret should shoot. If so, it makes the decision to shoot at the enemy.
        Method Return: void
    */
    checkShoot(enemyList){
        super.checkShoot(enemyList);
        this.decisions["angle"] = fixRadians(this.decisions["angle"] + toRadians(this.biases["shooting_angle_offset"]));
    }

    /*
        Method Name: adjustAngleToMatch
        Method Parameters:
            newShootingAngle:
                A new shooting angle to try and match
        Method Description: Adjusts the current angle to match a provided angle
        Method Return: void
    */
    /*adjustAngleToMatch(newShootingAngle){
        let currentShootingAngle = this.getShootingAngle();
        // Don't adjust if the same
        if (currentShootingAngle == newShootingAngle){ return; }
        let diffCW = calculateAngleDiffCWRAD(getShootingAngle, newShootingAngle); 
        let diffCCW = calculateAngleDiffCCWRAD(getShootingAngle, newShootingAngle);
        let rotateCW = (diffCW < diffCCW && this.isFacingRight()) || (diffCW > diffCCW && !this.isFacingRight())
        console.log("c: %d\nn: %d\ndcw: %d\ndccw: %d\nrotateCW:", currentShootingAngle, newShootingAngle, diffCW, diffCCW, rotateCW)
        // Rotate based on determination
        if (rotateCW){
            console.log("Rotating clockwise", toDegrees(diffCW), "old", toDegrees(this.angle), "new", toDegrees(rotateCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCW))))
            this.angle = rotateCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCW));
        }else{
            console.log("Rotating counterclockwise", toDegrees(diffCCW), "old", toDegrees(this.angle), "new", toDegrees(rotateCCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCCW))))
            this.angle = rotateCCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCCW));
        }
    }*/
    adjustAngleToMatch(newShootingAngle){
        let currentShootingAngle = this.getShootingAngle();
        // Don't adjust if the same
        if (currentShootingAngle == newShootingAngle){ return; }
        let diffCW = calculateAngleDiffCWRAD(currentShootingAngle, newShootingAngle); 
        let diffCCW = calculateAngleDiffCCWRAD(currentShootingAngle, newShootingAngle);
        let rotateCW = (diffCW < diffCCW && this.isFacingRight()) || (diffCW > diffCCW && !this.isFacingRight())
        // Rotate based on determination
        if (rotateCW){
            this.angle = rotateCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCW));
        }else{
            this.angle = rotateCCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCCW));
        }
    }

}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotBomberTurret;
}