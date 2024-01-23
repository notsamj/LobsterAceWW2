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
        this.shootLock = new CooldownLock(FILE_DATA["constants"]["PLANE_SHOOT_GAP_MS"]);
    }

    /*
        Method Name: shoot
        Method Parameters: None
        Method Description: Shoots a bullet from the plane
        Method Return: void
    */
    shoot(){
        this.scene.addBullet(new Bullet(this.getX(), this.getY(), this.scene, this.getXVelocity(), this.getYVelocity(), this.getShootingAngle(), this.getID(), this.getPlaneClass()));
    }

}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = FighterPlane;
}
