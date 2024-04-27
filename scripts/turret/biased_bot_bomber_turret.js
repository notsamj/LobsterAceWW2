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
            bulletHeatCapacity:
                The heat capacity of the turret
            coolingTimeMS:
                The time in miliseconds for the turret to fully cool down
            bulletDamage:
                The damage of bullets shot from this turret
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, plane, biases, bulletHeatCapacity, coolingTimeMS, bulletDamage){
        super(xOffset, yOffset, fov1, fov2, rateOfFire * biases["rate_of_fire_multiplier"], plane, bulletHeatCapacity, coolingTimeMS, bulletDamage);
        this.biases = biases;
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
        return new BiasedBotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], toRadians(gunObject["fov_1"]), toRadians(gunObject["fov_2"]), gunObject["rate_of_fire"], plane, biases, gunObject["bullet_heat_capacity"], gunObject["cooling_time_ms"], gunObject["bullet_damage"]);
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
        let angleBefore = this.decisions["angle"];
        super.checkShoot(enemyList);
        let angleNow = this.decisions["angle"];
        // Ignore if angle doesn't change the bias only affects changes
        if (angleBefore == angleNow){ return; }
        let adjustedAngle = fixRadians(this.decisions["angle"] + toRadians(this.biases["shooting_angle_offset"]));
        let shootingAngleOffset = this.biases["shooting_angle_offset"];
        // If adjusted angle is outside acceptable bounds then put it at the limit of the bounds
        if (!angleBetweenCWRAD(adjustedAngle, this.getFov1(), this.getFov2())){
            adjustedAngle = calculateAngleDiffRAD(angleNow, this.getFov1()) < calculateAngleDiffRAD(angleNow, this.getFov2()) ? this.getFov1() : this.getFov2();
        }
        // console.log(toDegrees(adjustedAngle), toDegrees(angleNow), toDegrees(this.getFov1()), toDegrees(this.getFov2()), angleBetweenCWRAD(adjustedAngle, this.getFov1(), this.getFov2()));
        this.decisions["angle"] = adjustedAngle;
    }

    /*
        Method Name: adjustAngleToMatch
        Method Parameters:
            newShootingAngle:
                A new shooting angle to try and match
        Method Description: Adjusts the current angle to match a provided angle
        Method Return: void
    */
    adjustAngleToMatch(newShootingAngle){
        let currentShootingAngle = this.getShootingAngle();
        // Don't adjust if the same
        if (currentShootingAngle == newShootingAngle){ return; }
        let diffCW = calculateAngleDiffCWRAD(currentShootingAngle, newShootingAngle); 
        let diffCCW = calculateAngleDiffCCWRAD(currentShootingAngle, newShootingAngle);
        let rotateCW = diffCW < diffCCW;
        // Rotate based on determination
        if (rotateCW){
            if (this.isFacingRight()){
                this.angle = rotateCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCW));
            }else{
                this.angle = rotateCCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCW));
            }
        }else{
            if (this.isFacingRight()){
                this.angle = rotateCCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCCW));
            }else{
                this.angle = rotateCWRAD(this.angle, Math.min(toRadians(this.biases["max_turret_angle_change_per_tick"]), diffCCW));
            }
        }
        //console.log("I want to aim at: %d\nI am now aiming at: %d\nI will now aim at: %d", toDegrees(newShootingAngle), toDegrees(currentShootingAngle), toDegrees(this.getShootingAngle()));
    }

}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotBomberTurret;
}