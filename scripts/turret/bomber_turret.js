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
                An angle (radians) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (radians) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
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
        super(null, null, fov1, fov2, rateOfFire, plane.getGamemode(), bulletHeatCapacity, coolingTimeMS, bulletDamage);
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.plane = plane;
        this.model = plane.getPlaneClass();
    }

    /*
        Method Name: displayHUD
        Method Parameters:
            timePassed:
                The time passed since the last tick (MS)
            offset:
                The offset of the gun UI
        Method Description: Display the HUD of the bomber plane
        Method Return: void
    */
    displayHUD(timePassed, offset){
        this.turretHeatManager.display(timePassed, offset);
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.shootCD.tick();
        this.turretHeatManager.tick();
    }

    /*
        Method Name: isAutonomous
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: Boolean
    */
    isAutonomous(){
        return this.plane.isAutonomous();
    }

    /*
        Method Name: getGamemode
        Method Parameters: None
        Method Description: Interface for a function that is associated with a member variable of this class
        Method Return: Gamemode
    */
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
        Method Parameters: None
        Method Description: Shoots the turret, if it is ready and the angle is in an allowed range.
        Method Return: void
    */
    shoot(){
        let shootingAngleRAD = this.getShootingAngle();
        // If not within the area then don't shoot
        if (!angleBetweenCWRAD(shootingAngleRAD, this.getFov1(), this.getFov2())){
            // console.log("bad", toDegrees(shootingAngleRAD), toDegrees(this.getFov1()), toDegrees(this.getFov2()))
            return;
        }
        this.shootCD.lock();
        this.turretHeatManager.shoot();
        this.getGamemode().getSoundManager().play("shoot", this.getX(), this.getY());
        if (this.getGamemode().areBulletPhysicsEnabled()){
            //console.log("bullet", this.getX(), this.getY(), this.getGamemode(), this.getXVelocity(), this.getYVelocity(), shootingAngleRAD, this.getID(), this.model, this.damage)
            this.getGamemode().getTeamCombatManager().addBullet(new Bullet(this.getX(), this.getY(), this.getGamemode(), this.getXVelocity(), this.getYVelocity(), shootingAngleRAD, this.getID(), this.model, this.damage));
        }else{ // Fake bullets
            this.plane.instantShot(this.getX(), this.getY(), shootingAngleRAD, new Bullet(null, null, this.plane.getGamemode(), null, null, null, this.plane.getID(), this.plane.getPlaneClass(), this.damage));
        }
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Calculates the location of the turret on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getX(){
        let planeAngleRAD = this.plane.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180))
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
        let planeAngleRAD = this.plane.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180))
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
        let planeAngleRAD = this.plane.getInterpolatedAngle();
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
        let planeAngleRAD = this.plane.getInterpolatedAngle();
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
        let adjustedFov = !this.isFacingRight() ? (toRadians(180) - this.fov2) : this.fov1;
        if (!this.isFacingRight()){
            adjustedFov = fixRadians(adjustedFov + toRadians(180))
        }
        return fixRadians(adjustedFov + this.plane.getNoseAngle());
    }

    /*
        Method Name: getFov2
        Method Parameters: None
        Method Description: Determines the edge angle of the field of view (the end with the other one being in a counter clockwise direction)
        Method Return: int
    */
    getFov2(){
        let adjustedFov = !this.isFacingRight() ? (toRadians(180) - this.fov1) : this.fov2;
        if (!this.isFacingRight()){
            adjustedFov = fixRadians(adjustedFov + toRadians(180))
        }
        return fixRadians(adjustedFov + this.plane.getNoseAngle());
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

    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Provides the current shooting angle
        Method Return: Float
    */
    getShootingAngle(){
        let shootingAngle = this.angle;
        // If facing left, adjust
        if (!this.isFacingRight()){
            shootingAngle = 2 * Math.PI - shootingAngle;
        }
        shootingAngle = fixRadians(shootingAngle + this.plane.getNoseAngle());
        return shootingAngle;
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
        //console.log("currently: %d\nnew: %d\ndiffCW: %d\ndiffCCW: %d\nnewAngle if rotatecw: %d\nnewAngle if rotateccw: %d\nrotateCW:", toDegrees(currentShootingAngle), toDegrees(newShootingAngle), toDegrees(diffCW), toDegrees(diffCCW), toDegrees(rotateCWRAD(this.angle, diffCW)), toDegrees(rotateCCWRAD(this.angle, diffCCW)), rotateCW);
        // Rotate based on determination
        if (rotateCW){
            if (this.isFacingRight()){
                this.angle = rotateCWRAD(this.angle, diffCW);
            }else{
                this.angle = rotateCCWRAD(this.angle, diffCW);
            }
        }else{
            if (this.isFacingRight()){
                this.angle = rotateCCWRAD(this.angle, diffCCW);
            }else{
                this.angle = rotateCWRAD(this.angle, diffCCW);
            }
        }
    }

    /*
        Method Name: executeDecisions
        Method Parameters: None
        Method Description: Takes actions based on decisions
        Method Return: void
    */
    executeDecisions(){
        // If decided to shoot
        if (this.decisions["shooting"]){
            if (this.shootCD.isReady() && this.turretHeatManager.canShoot() && this.getGamemode().runsLocally()){
                this.shoot();
            }
        }
        // Move turret to match angle
        this.adjustAngleToMatch(this.decisions["angle"]);
    }
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = BomberTurret;
}