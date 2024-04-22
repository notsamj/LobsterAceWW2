// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    BomberTurret = require("./bomber_turret.js");
    helperFunctions = require("../general/helper_functions.js");
    displacementToRadians = helperFunctions.displacementToRadians;
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
            plane:
                The bomber plane which the turret is attached to
            bulletHeatCapacity:
                The heat capacity of the turret
            coolingTimeMS:
                The time in miliseconds for the turret to fully cool down
        Method Description: Constructor
        Method Return: Constructor
    */

    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, plane, bulletHeatCapacity, coolingTimeMS){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, plane, bulletHeatCapacity, coolingTimeMS);
    }

    /*
        Method Name: makeDecisions
        Method Parameters: None
        Method Description: Makes decisions for what to do in the next tick
        Method Return: void
    */
    makeDecisions(){
        if (!this.isAutonomous()){ return; }
        this.resetDecisions();
        this.checkShoot();
    }
    
    /*
        Method Name: getMouseAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret by looking at the position of the user's mouse.
        Method Return: int
    */
    getMouseAngle(){
        let x = window.mouseX - getScreenWidth() / 2;
        let y = this.getGamemode().getScene().changeFromScreenY(window.mouseY) - getScreenHeight() / 2;
        let x0 = 0;
        let y0 = 0;
        return displacementToRadians(x - x0, y - y0);
    }

    /*
        Method Name: checkShoot
        Method Parameters: None
        Method Description: Check if the user wishes to shoot and if so, shoots
        Method Return: void
    */
    checkShoot(){
        if (USER_INPUT_MANAGER.isActivated("bomber_shoot_input")){
            let mouseAngle = this.getMouseAngle();
            // Ignore planes that aren't in line of sight
            if (!angleBetweenCWRAD(mouseAngle, this.getFov1(), this.getFov2())){
                return; 
            }
            this.decisions["shooting"] = true;
            this.decisions["angle"] = mouseAngle;
        }
    }

    /*
        Method Name: create
        Method Parameters:
            gunObject:
                A JSON object with details about the gun
            plane:
                The bomber plane which the turret is attached to
        Method Description: Create a bot bomber turret
        Method Return: HumanBomberTurret
    */
    static create(gunObject, plane){
        return new HumanBomberTurret(gunObject["x_offset"], gunObject["y_offset"], toRadians(gunObject["fov_1"]), toRadians(gunObject["fov_2"]), gunObject["rate_of_fire"], plane, gunObject["bullet_heat_capacity"], gunObject["cooling_time_ms"]);
    }
}
// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = HumanBomberTurret;
}