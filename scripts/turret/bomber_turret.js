// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Turret = require("./turret.js");
    Bullet = require("../other_entities/simple_projectiles/bullet.js");
}
/*
    Class Name: BomberTurret
    Description: Abstract class representing a Turret attached to a Bomber plane
*/
class BomberTurret extends Turret {
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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset, fov1, fov2, rateOfFire, plane){
        super(null, null, fov1, fov2, rateOfFire, plane.getGamemode());
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.plane = plane;
        this.model = plane.getPlaneClass();
    }

    isAutonomous(){
        return this.plane.isAutonomous();
    }

    getGamemode(){
        return this.plane.getGamemode();
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the turret
        Method Return: JSON Object
    */
    toJSON(){
        let rep = {};
        rep["decisions"] = this.decisions;
        rep["shoot_cd"] = this.shootCD.getTicksLeft();
        return rep;
    }

    /*
        Method Name: shoot
        Method Parameters:
            shootingAngle:
                The angle at which to shoot
        Method Description: Shoots the turret, if it is ready and the angle is in an allowed range.
        Method Return: void
    */
    shoot(shootingAngle){
        if (!this.readyToShoot()){ return; }
        if (!angleBetweenCWDEG(shootingAngle, this.getFov1(), this.getFov2())){ 
            return; 
        }
        this.shootCD.lock();
        this.getGamemode().getSoundManager().play("shoot", this.getX(), this.getY());
        if (this.getGamemode().areBulletPhysicsEnabled()){
            this.getGamemode().getTeamCombatManager().addBullet(new Bullet(this.getX(), this.getY(), this.getGamemode(), this.getXVelocity(), this.getYVelocity(), this.decisions["angle"], this.getID(), this.model));
        }else{ // Fake bullets
            this.plane.instantShot(this.getX(), this.getY(), this.getShootingAngle());
        }
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Calculates the location of the turret on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getX(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * this.getXOffset() - Math.sin(planeAngleRAD) * this.getYOffset() + this.plane.getX();
        return rotatedX;
    }

    /*
        Method Name: getY
        Method Parameters: None
        Method Description: Calculates the location of the turret on the y axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getY(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * this.getXOffset() + Math.cos(planeAngleRAD) * this.getYOffset() + this.plane.getY();
        return rotatedY;
    }

    /*
        Method Name: getInterpolatedX
        Method Parameters: None
        Method Description: Calculates the interpolated x of the turret
        Method Return: Number
    */
    getInterpolatedX(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * this.getXOffset() - Math.sin(planeAngleRAD) * this.getYOffset() + this.plane.getInterpolatedX();
        return rotatedX;
    }

    /*
        Method Name: getInterpolatedY
        Method Parameters: None
        Method Description: Calculates the interpolated y of the turret
        Method Return: Number
    */
    getInterpolatedY(){
        let planeAngleRAD = toRadians(this.plane.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * this.getXOffset() + Math.cos(planeAngleRAD) * this.getYOffset() + this.plane.getInterpolatedY();
        return rotatedY;
    }

    /*
        Method Name: getXOffset
        Method Parameters: None
        Method Description: Calculates the offset of the turret in relation to the x axis and considering the left/right orientation of the attached plane.
        Method Return: float
    */
    getXOffset(){
        return this.xOffset * (this.plane.isFacingRight() ? 1 : -1);
    }

    /*
        Method Name: getYOffset
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getYOffset(){
        return this.yOffset;
    }

    /*
        Method Name: isFacingRight
        Method Parameters: None
        Method Description: Determines if the attacked plane is facing left/right
        Method Return: boolean, true -> facing right, false -> not facing right
    */
    isFacingRight(){
        return this.plane.isFacingRight();
    }

    /*
        Method Name: getFov1
        Method Parameters: None
        Method Description: Determines the edge angle of the field of view (the end with the other one being in a clockwise direction)
        Method Return: int
    */
    getFov1(){
        let adjustedFov = !this.isFacingRight() ? (180 - this.fov2) : this.fov1;
        if (!this.isFacingRight()){
            adjustedFov += 180;
        }
        return fixDegrees(adjustedFov + this.plane.getNoseAngle());
    }

    /*
        Method Name: getFov2
        Method Parameters: None
        Method Description: Determines the edge angle of the field of view (the end with the other one being in a counter clockwise direction)
        Method Return: int
    */
    getFov2(){
        let adjustedFov = !this.isFacingRight() ? (180 - this.fov1) : this.fov2;
        if (!this.isFacingRight()){
            adjustedFov += 180;
        }
        return fixDegrees(adjustedFov + this.plane.getNoseAngle());
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Determines the x velocity of the associated plane
        Method Return: float
    */
    getXVelocity(){
        return this.plane.getXVelocity();
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Determines the y velocity of the associated plane
        Method Return: float
    */
    getYVelocity(){
        return this.plane.getYVelocity();
    }

    /*
        Method Name: getID
        Method Parameters: None
        Method Description: Determines the id of the associated plane
        Method Return: String
    */
    getID(){ return this.plane.getID(); }
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = BomberTurret;
}