// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    BomberTurret = require("./bomber_turret.js");
    helperFunctions = require("../general/helper_functions.js");
    getDegreesFromDisplacement = helperFunctions.getDegreesFromDisplacement;
}
/*
    Class Name: HumanBomberTurret
    Description: Class representing a Turret attached to a Bomber plane that is operated by a human
*/
class HumanBomberTurret extends BomberTurret {
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
            gamemode:
                A gamemode object that the human bomber turret is a part of
            plane:
                The bomber plane which the turret is attached to
            autonomous:
                Whether or not the turret may control itself
        Method Description: Constructor
        Method Return: Constructor
    */

    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, gamemode, plane, autonomous=true){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, gamemode, plane);
        this.autonomous = autonomous;
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for what to do in the next tick
        Method Return: void
    */
    makeDecisions(){
        if (!this.autonomous){ return; }
        this.resetDecisions();
        this.checkShoot();
    }
    
    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret by looking at the position of the user's mouse.
        Method Return: int
    */
    getShootingAngle(){
        let x = window.mouseX - getScreenWidth() / 2;
        let y = this.gamemode.getScene().changeFromScreenY(window.mouseY) - getScreenHeight() / 2;
        let x0 = 0;
        let y0 = 0;
        return getDegreesFromDisplacement(x - x0, y - y0);
    }

    /*
        Method Name: checkShoot
        Method Parameters: None
        Method Description: Check if the user wishes to shoot and if so, shoots
        Method Return: void
    */
    checkShoot(){
        if (USER_INPUT_MANAGER.isActivated("bomber_shoot_input")){
            this.decisions["shooting"] = true;
            this.decisions["angle"] = this.getShootingAngle();
        }
    }

    /*
        Method Name: executeDecisions
        Method Parameters: None
        Method Description: Take actions based on decisions
        Method Return: void
    */
    executeDecisions(){
        // If decided to shoot
        if (this.decisions["shooting"]){
            if (this.shootCD.isReady()){
                this.shoot(this.decisions["angle"]);
            }
        }
    }

    /*
        Method Name: create
        Method Parameters:
            gunObject:
                A JSON object with details about the gun
            gamemode:
                A gamemode object related to the turret
            plane:
                The bomber plane which the turret is attached to
            autonomous:
                Whether the turret is autonomous or not
        Method Description: Create a bot bomber turret
        Method Return: HumanBomberTurret
    */
    static create(gunObject, gamemode, plane, autonomous){
        return new HumanBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], gamemode, plane, autonomous);
    }
}
// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = HumanBomberTurret;
}