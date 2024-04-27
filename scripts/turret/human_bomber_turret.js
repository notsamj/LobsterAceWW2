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
            bulletDamage:
                The damage of bullets shot from this turret
        Method Description: Constructor
        Method Return: Constructor
    */

    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, plane, bulletHeatCapacity, coolingTimeMS, bulletDamage){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, plane, bulletHeatCapacity, coolingTimeMS, bulletDamage);
    }

    /*
        Method Name: applyDamageMultiplier
        Method Parameters:
            multiplier:
                A multiplier value
        Method Description: Modifies the damage dealt by the human bomber turret
        Method Return: void
    */
    applyDamageMultiplier(multiplier){
        this.damage *= multiplier;
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
        Method Name: getX
        Method Parameters: None
        Method Description: Calculates the location of the turret on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getTurretScreenX(){
        let planeAngleRAD = this.plane.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180))
        }
        return Math.cos(planeAngleRAD) * this.getXOffset() * gameZoom - Math.sin(planeAngleRAD) * this.getYOffset() * gameZoom + getScreenWidth() / 2;
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Calculates the location of the turret on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getTurretScreenY(){
        let planeAngleRAD = this.plane.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180))
        }
        return Math.sin(planeAngleRAD) * this.getXOffset() * gameZoom + Math.cos(planeAngleRAD) * this.getYOffset() * gameZoom + getScreenHeight() / 2;
    }
    
    /*
        Method Name: getMouseAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret by looking at the position of the user's mouse.
        Method Return: int
    */
    getMouseAngle(){
        let mouseScreenX = mouseX;
        let mouseScreenY = this.getGamemode().getScene().changeFromScreenY(mouseY);
        let turretScreenX = this.getTurretScreenX();
        let turretScreenY = this.getTurretScreenY();
        return displacementToRadians(mouseScreenX - turretScreenX, mouseScreenY - turretScreenY);
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
        return new HumanBomberTurret(gunObject["x_offset"], gunObject["y_offset"], toRadians(gunObject["fov_1"]), toRadians(gunObject["fov_2"]), gunObject["rate_of_fire"], plane, gunObject["bullet_heat_capacity"], gunObject["cooling_time_ms"], gunObject["bullet_damage"]);
    }
}
// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = HumanBomberTurret;
}