/*
    Class Name: BomberPlane
    Description: Abstract class representing a Bomber Plane
*/
class BomberPlane extends Plane {
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
    }

    /*
        Method Name: getBombBayX
        Method Parameters: None
        Method Description: Calculates the location of the gun on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getBombBayX(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedX = Math.cos(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_Y"] + this.getX();
        return rotatedX;
    }

    /*
        Method Name: getBombBayY
        Method Parameters: None
        Method Description: Calculates the location of the gun on the y axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getBombBayY(){
        let planeAngleRAD = toRadians(this.getNoseAngle());
        if (!this.isFacingRight()){
            planeAngleRAD -= toRadians(180);
        }
        let rotatedY = Math.sin(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_X"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["BOMB_OFFSET_Y"] + this.getY();
        return rotatedY;
    }

    /*
        Method Name: dropBomb
        Method Parameters: None
        Method Description: Drops a bomb from the bomber
        Method Return: void
    */
    dropBomb(){
        SOUND_MANAGER.play("bomb", this.x, this.y);
        this.scene.addBomb(new Bomb(this.getBombBayX(), this.getBombBayY(), this.scene, this.getXVelocity(), this.getYVelocity()));
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays a bomber plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Super call to remove (some) code repetition
        super.display(lX, bY);
        
        // If dead don't display gun flashes
        if (this.isDead()){
            return;
        }

        // For each gun, if on shooting cooldown then show the flash image
        for (let gun of this.guns){
            if (!gun.readyToShoot()){
                // Display flash
                let rotateX = this.scene.getDisplayX(gun.getX(), 0, lX);
                let rotateY = this.scene.getDisplayY(gun.getY(), 0, bY);
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
}
