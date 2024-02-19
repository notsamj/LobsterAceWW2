// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../data/data_json.js");
    helperFunctions = require("../general/helper_functions.js");
    angleBetweenCWDEG = helperFunctions.angleBetweenCWDEG;
    Bullet = require("../bullet.js");
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
                An angle (degrees) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (degrees) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            scene:
                A Scene object related to the fighter plane
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, fov1, fov2, rateOfFire, scene){
        this.x = x;
        this.y = y;
        this.shootCD = new TickLock(rateOfFire * PROGRAM_DATA["settings"]["bullet_reduction_coefficient"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.fov1 = fov1;
        this.fov2 = fov2;
        this.scene = scene;
        this.model = "turret";
        this.decisions = {
            "shooting": false, // true -> shooting, false -> not shooting
            "angle": null // angle in degrees [0,359]
        }
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.shootCD.tick();
        this.makeDecisions();
        this.executeDecisions();
    }

    // Abstract
    makeDecisions(){}

    // TODO: Comments
    executeDecisions(){
        // If decided to shoot
        if (this.decisions["shooting"]){
            if (this.shootCD.isReady()){
                this.decisions["shooting"] = false;
                this.shoot(this.decisions["angle"]);
                this.shootCD.lock();
            }
        }
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
        Method Name: shoot
        Method Parameters:
            shootingAngle:
                Angle of the shot
        Method Description: Shoots the turret, if the angle is in the allowed range.
        Method Return: void
    */
    shoot(shootingAngle){
        if (!angleBetweenCWDEG(shootingAngle, this.getFov1(), this.getFov2())){ return; }
        this.scene.getSoundManager().play("shoot", this.getX(), this.getY());
        this.scene.addBullet(new Bullet(this.getX(), this.getY(), this.scene, this.getXVelocity(), this.getYVelocity(), this.getShootingAngle(), this.getID(), this.model));
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

    // Abstract
    getShootingAngle(){}
    getID(){}
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = Turret;
}