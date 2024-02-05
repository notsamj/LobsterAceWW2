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
        this.shootLock = new TickLock(FILE_DATA["constants"]["PLANE_SHOOT_GAP_MS"] * FILE_DATA["constants"]["BULLET_REDUCTION_COEFFICIENT"] / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiffMS:
                The time between ticks
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(timeDiffMS){
        this.shootLock.tick();
        super.tick(timeDiffMS);
    }

    /*
        Method Name: shoot
        Method Parameters: None
        Method Description: Shoots a bullet from the plane
        Method Return: void
    */
    shoot(){
        SOUND_MANAGER.play("shoot", this.x, this.y);
        // If using physical bullets then do it this way
        if (FILE_DATA["constants"]["USE_PHYSICS_BULLETS"]){
            this.scene.addBullet(new Bullet(this.getGunX(), this.getGunY(), this.scene, this.getXVelocity(), this.getYVelocity(), this.getNoseAngle(), this.getID(), this.getPlaneClass()));
        }else{ // Fake bullets
            this.instantShot(this.getGunX(), this.getGunY(), this.getNoseAngle());
        }
    }

    /*
        Method Name: getGunX
        Method Parameters: None
        Method Description: Calculates the location of the gun on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getGunX(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * (FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_Y"] + this.getX();
        return rotatedX;
    }

    /*
        Method Name: getGunY
        Method Parameters: None
        Method Description: Calculates the location of the gun on the y axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getGunY(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * (FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * FILE_DATA["plane_data"][this.getPlaneClass()]["GUN_OFFSET_Y"] + this.getY();
        return rotatedY;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Super call to remove (some) code repetition
        super.display(lX, bY);

        // If you've previously shot then display a flash to indicate
        if (this.shootLock.notReady()){
            // Display flash
            let rotateX = this.scene.getDisplayX(this.getGunX(), 0, lX);
            let rotateY = this.scene.getDisplayY(this.getGunY(), 0, bY);
            let flashImageWidth = images["flash"].width;
            let flashImageHeight = images["flash"].height;

            // Prepare the display
            translate(rotateX, rotateY);
            rotate(-1 * toRadians(this.getAngle()));
            // If facing left then turn around the display
            if (!this.isFacingRight()){
                scale(-1, 1);
            }

            // Display flash
            drawingContext.drawImage(images["flash"], 0 - flashImageWidth / 2,  0 - flashImageHeight / 2);

            // If facing left then turn around the display (reset)
            if (!this.isFacingRight()){
                scale(-1, 1);
            }
            // Reset the rotation and translation
            rotate(toRadians(this.getAngle()));
            translate(-1 * rotateX, -1 * rotateY);
        }
    }

}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = FighterPlane;
}
