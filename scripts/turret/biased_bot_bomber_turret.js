// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../data/data_json.js");
    TickLock = require("../general/tick_lock.js");
    BotBomberTurret = require("./bot_bomber_turret.js");
    helperFunctions = require("../general/helper_functions.js");
    fixDegrees = helperFunctions.fixDegrees;
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
        this.shootingAngle = 0;
        this.shootCD = new TickLock(this.shootCD.getCooldown() * this.biases["rate_of_fire_multiplier"]);
    }

    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret.
        Method Return: int
    */
    getShootingAngle(){
        return fixDegrees(this.decisions["angle"] + this.biases["shooting_angle_offset"]);
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
        return new BiasedBotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], plane, biases);
    }
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = BiasedBotBomberTurret;
}