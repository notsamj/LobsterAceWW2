// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    Plane = require("../plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    toRadians = helperFunctions.toRadians;
}
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
            gamemode:
                A gamemode object related to the fighter plane
            autonomous:
                Whether not not the plane can make its own decisions
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, autonomous){
        super(planeClass, gamemode, autonomous);
        this.decisions["bombing"] = false;
        this.bombLock = new TickLock(750 / PROGRAM_DATA["settings"]["ms_between_ticks"]);
    }

    /*
        Method Name: loadImportantData
        Method Parameters:
            rep:
                A Json representation of the plane sent by the server
        Method Description: Loads important data received from the server
        Method Return: void
    */
    loadImportantData(rep){
        // This is always local being received from the server
        this.health = rep["basic"]["health"];
        this.dead = rep["basic"]["dead"];
        this.bombLock.setTicksLeft(rep["locks"]["bomb_lock"]);
        for (let i = 0; i < this.guns.length; i++){
            this.guns[i].loadImportantData(rep["guns"][i]); // TODO: I need 1 function to load shoot lock tick timer and another function to load the deicison to shoot
        }
    }

    /*
        Method Name: loadDecisions
        Method Parameters:
            rep:
                A Json representation of the plane sent by the server
        Method Description: Loads important decisions received from the server
        Method Return: void
    */
    loadDecisions(rep){
        this.decisions["bombing"] = rep["decisions"]["bombing"];
        for (let i = 0; i < this.guns.length; i++){
            this.guns[i].loadDecisions(rep["guns"][i]); // TODO: I need 1 function to load shoot lock tick timer and another function to load the deicison to shoot
        }
    }

    /*
        Method Name: getBombBayX
        Method Parameters: None
        Method Description: Calculates the location of the gun on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getBombBayX(){
        let planeAngleRAD = this.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180));
        }
        let rotatedX = Math.cos(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["bomb_offset_x"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["bomb_offset_y"] + this.getX();
        return rotatedX;
    }

    /*
        Method Name: getBombBayY
        Method Parameters: None
        Method Description: Calculates the location of the gun on the y axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getBombBayY(){
        let planeAngleRAD = this.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180));
        }
        let rotatedY = Math.sin(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["bomb_offset_x"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["bomb_offset_y"] + this.getY();
        return rotatedY;
    }

    /*
        Method Name: dropBomb
        Method Parameters: None
        Method Description: Drops a bomb from the bomber
        Method Return: void
    */
    dropBomb(){
        this.gamemode.getSoundManager().play("bomb", this.x, this.y);
        this.gamemode.getTeamCombatManager().addBomb(new Bomb(this.getBombBayX(), this.getBombBayY(), this.gamemode, this.getXVelocity(), this.getYVelocity(), this.gamemode.getNumTicks(), this.planeClass));
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
        Method Description: Displays a bomber plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        this.calculateInterpolatedCoordinates(displayTime);
        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Super call to remove (some) code repetition
        super.display(lX, bY, displayTime);
        
        // If dead don't display gun flashes
        if (this.isDead()){
            return;
        }

        // For each gun, if on shooting cooldown then show the flash image
        for (let gun of this.guns){
            if (!gun.readyToShoot()){
                // Display flash
                let rotateX = this.gamemode.getScene().getDisplayX(gun.getInterpolatedX(), 0, lX);
                let rotateY = this.gamemode.getScene().getDisplayY(gun.getInterpolatedY(), 0, bY);
                let interpolatedAngle = this.getInterpolatedAngle();
                let flashImage = getImage("flash");
                let flashImageWidth = flashImage.width;
                let flashImageHeight = flashImage.height;

                // Prepare the display
                translate(rotateX, rotateY);
                rotate(-1 * interpolatedAngle);

                // If facing left then turn around the display
                if (!this.isFacingRight()){
                    scale(-1, 1);
                }

                // Display flash
                drawingContext.drawImage(flashImage, 0 - flashImageWidth / 2,  0 - flashImageHeight / 2);

                // If facing left then turn around the display (reset)
                if (!this.isFacingRight()){
                    scale(-1, 1);
                }
                
                // Reset the rotation and translation
                rotate(interpolatedAngle);
                translate(-1 * rotateX, -1 * rotateY);
            }
        }
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BomberPlane;
}