// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../data/data_json.js");
}
/*
    Class Name: Turret
    Description: Abstract class representing a Turret
    Note: Some of this assumes a stationary turret. Anything that does so is overriden.
*/
class Turret {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The x location of the turret
            y:
                The y location of the turret
            fov1:
                An angle (radians) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (radians) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            gamemode:
                A gamemode object related to the turret
            bulletHeatCapacity:
                The heat capacity of the turret
            coolingTimeMS:
                The time in miliseconds for the turret to fully cool down
            bulletDamage:
                The damage of bullets shoot from this turret
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, fov1, fov2, rateOfFire, gamemode, bulletHeatCapacity, coolingTimeMS, bulletDamage){
        this.x = x;
        this.y = y;
        this.shootCD = new TickLock(rateOfFire * PROGRAM_DATA["settings"]["bullet_reduction_coefficient"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.turretHeatManager = new GunHeatManager(bulletHeatCapacity, coolingTimeMS);
        this.fov1 = fov1;
        this.fov2 = fov2;
        this.gamemode = gamemode;
        this.model = "turret";
        this.startingAngle = (fov1 + fov2)/2;
        this.angle = this.startingAngle;
        this.damage = bulletDamage;
        this.decisions = {
            "shooting": false, // true -> shooting, false -> not shooting
            "angle": this.startingAngle // angle in radians [0,2*PI)
        }
    }

    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Provides the current shooting angle
        Method Return: Float
    */

    getShootingAngle(){
        return this.angle;
    }

    /*
        Method Name: loadImportantData
        Method Parameters:
            rep:
                A json representation of the turret
        Method Description: Loads information from the json representation
        Method Return: void
    */
    loadImportantData(rep){
        this.shootCD.setTicksLeft(rep["shoot_cd"]);
    }

    /*
        Method Name: loadDecisions
        Method Parameters:
            rep:
                A json representation of the turret
        Method Description: Loads decisions from the json representation
        Method Return: void
    */
    loadDecisions(rep){
        this.decisions = rep["decisions"];
    }

    /*
        Method Name: initFromJSON
        Method Parameters:
            rep:
                A json representation of the turret
        Method Description: Loads information from the json representation on first creation
        Method Return: void
    */
    initFromJSON(rep){
        this.loadImportantData(rep);
        this.loadDecisions(rep);
    }


    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.shootCD.tick();
        this.executeDecisions();
        this.makeDecisions();
    }

    // Abstract
    makeDecisions(){}
    executeDecisions(){}

    /*
        Method Name: resetDecisions
        Method Parameters: None
        Method Description: Clear decisions so new decisions reflect current priorities
        Method Return: void
    */
    resetDecisions(){
        this.decisions["shooting"] = false;
        this.decisions["angle"] = this.getShootingAngle(); // Don't move
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getX(){
        return this.x;
    }

    /*
        Method Name: getY
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getY(){
        return this.y;
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getXVelocity(){
        return 0;
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getYVelocity(){
        return 0;
    }

    /*
        Method Name: getFov1
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getFov1(){
        return this.fov1;
    }

    /*
        Method Name: getFov2
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getFov2(){
        return this.fov2;
    }

    /*
        Method Name: readyToShoot
        Method Parameters: None
        Method Description: Determines if the turret is ready to shoot
        Method Return: true -> ready, false -> not ready
    */
    readyToShoot(){
        return this.shootCD.isReady();
    }

    getID(){}
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = Turret;
}