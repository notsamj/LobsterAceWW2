// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    CooldownLock = require("../scripts/cooldown_lock.js");
}
/*
    Class Name: FighterPlane
    Description: Abstract class representing a FighterPlane
*/
class FighterPlane extends Plane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(planeClass, scene);
        this.shootLock = new CooldownLock(FILE_DATA["constants"]["PLANE_SHOOT_GAP_MS"] * FILE_DATA["constants"]["BULLET_REDUCTION_COEFFICIENT"]);
    }

    /*
        Method Name: shoot
        Method Parameters: None
        Method Description: Shoots a bullet from the plane
        Method Return: void
    */
    shoot(){
        SOUND_MANAGER.play("shoot", this.x, this.y);
        this.scene.addBullet(new Bullet(this.getGunX(), this.getGunY(), this.scene, this.getXVelocity(), this.getYVelocity(), this.getNoseAngle(), this.getID(), this.getPlaneClass()));
    }

    // TODO: These functions need comments
    getGunX(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * (FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_Y"] + this.getX();
        return rotatedX;
    }

    getGunY(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * (FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_Y"] + this.getY();
        return rotatedY;
    }

}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = FighterPlane;
}
