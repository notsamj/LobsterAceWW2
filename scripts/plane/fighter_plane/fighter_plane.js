// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    TickLock = require("../../general/tick_lock.js");
    Bullet = require("../../bullet.js");
    Plane = require("../plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    toRadians = helperFunctions.toRadians;
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
        this.shootLock = new TickLock(PROGRAM_DATA["settings"]["plane_shoot_gap_ms"] * PROGRAM_DATA["settings"]["bullet_reduction_coefficient"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
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

    // TODO: Comments
    resetDecisions(){
        this.decisions["face"] = 0;
        this.decisions["angle"] = 0;
        this.decisions["shoot"] = false;
        this.decisions["throttle"] = 0;
    }

    // TODO: Comments
    static areMovementDecisionsChanged(decisions1, decisions2){
        let c1 = decisions1["face"] != decisions2["face"];
        if (c1){ return true; }
        let c2 = decisions1["angle"] != decisions2["angle"];
        if (c2){ return true; }
        let c3 = decisions1["throttle"] != decisions2["throttle"];
        return c3;
    }

    // TODO: Comments
    executeDecisions(){
        // Check shooting
        if (this.decisions["shoot"]){
            if (this.shootLock.isReady() && (!this.scene.isLocal() || activeGamemode.runsLocally())){
                this.shootLock.lock();
                this.shoot();
            }
        }

        // Change facing direction
        if (this.decisions["face"] != 0){
            this.face(this.decisions["face"] == 1 ? true : false);
        }

        // Adjust angle
        if (this.decisions["angle"] != 0){
            this.adjustAngle(this.decisions["angle"]);
        }

        // Adjust throttle
        if (this.decisions["throttle"] != 0){
            this.adjustThrottle(this.decisions["throttle"]);
        }
    }

    /*
        Method Name: shoot
        Method Parameters: None
        Method Description: Shoots a bullet from the plane
        Method Return: void
    */
    shoot(){
        this.scene.getSoundManager().play("shoot", this.x, this.y);
        // If using physical bullets then do it this way
        if (this.scene.areBulletPhysicsEnabled()){
            //console.log("add bullet")
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
        let rotatedX = Math.cos(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getX();
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
        let rotatedY = Math.sin(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getY();
        return rotatedY;
    }

    // TODO: Comments
    getInterpolatedGunX(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getInterpolatedX();
        return rotatedX;
    }

    // TODO: Comments
    getInterpolatedGunY(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getInterpolatedY();
        return rotatedY;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
            displayTime:
                The time used to interpolate the positions of the planes
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Super call to remove (some) code repetition
        super.display(lX, bY, displayTime);

        // If dead don't display gun flash
        if (this.isDead()){
            return;
        }

        // If you've previously shot then display a flash to indicate
        if (this.shootLock.notReady()){
            // Display flash
            let rotateX = this.scene.getDisplayX(this.getInterpolatedGunX(), 0, lX);
            let rotateY = this.scene.getDisplayY(this.getInterpolatedGunY(), 0, bY);
            let interpolatedAngle = this.getInterpolatedAngle();
            let flashImageWidth = getImage("flash").width;
            let flashImageHeight = getImage("flash").height;

            // Prepare the display
            translate(rotateX, rotateY);
            rotate(-1 * toRadians(interpolatedAngle));
            // If facing left then turn around the display
            if (!this.isFacingRight()){
                scale(-1, 1);
            }

            // Display flash
            drawingContext.drawImage(getImage("flash"), 0 - flashImageWidth / 2,  0 - flashImageHeight / 2);

            // If facing left then turn around the display (reset)
            if (!this.isFacingRight()){
                scale(-1, 1);
            }
            // Reset the rotation and translation
            rotate(toRadians(interpolatedAngle));
            translate(-1 * rotateX, -1 * rotateY);
        }
    }

}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = FighterPlane;
}