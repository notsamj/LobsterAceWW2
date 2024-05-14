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
        this.bombLock = new TickLock(PROGRAM_DATA["bomb_data"]["bomb_gap_ms"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.props = [];
        for (let propObject of PROGRAM_DATA["plane_data"][planeClass]["propellers"]){
            this.props.push(new Propeller(this, propObject));
        }
    }

    /*
        Method Name: getBombHitX
        Method Parameters: None
        Method Description: Calculate how far the bomb will travel (in x) while falling
        Method Return: float
    */
    getBombHitX(){
        return this.x + this.getBombXAirTravel() * (this.isFacingRight() ? 1 : -1);
    }

    /*
        Method Name: getBombXAirTravel
        Method Parameters: None
        Method Description: Calculate how far the bomb will travel (in x) while falling
        Method Return: float
    */
    getBombXAirTravel(){
        // If the plane is at/below ground don't bother with computation
        if (this.y <= 0){ return 0; }
        // Calculate time to hit ground
        /*
            d = vI * t + 1/2 * g * t^2
            d = 0.5g * t^2 + vI * t + 0
            0 = 0.5g * t^2 + vI * t - d
            t = [-1 * vI + sqrt(vI + 2 * g * d)] / g
        */
        let vI = this.bombInitialYVelocity();
        let g = PROGRAM_DATA["constants"]["gravity"];
        let d = this.y;
        // Note: There may be some error here because I wasn't thinking too clearly when I was setting up the equation and considering the direction of the initial velocity
        let time = (vI + Math.sqrt(Math.pow(vI, 2) + 2 * d * g)) / g;
        // Calculate x distance covered in that time
        return Math.abs(this.getXVelocity() * time);
    }

    /*
        Method Name: bombInitialYVelocity
        Method Parameters: None
        Method Description: Calculate the the initial y velocity of the bomb
        Method Return: float
    */
    bombInitialYVelocity(){
        return this.getYVelocity() + PROGRAM_DATA["bomb_data"]["initial_y_velocity"]; 
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
        this.gamemode.getSoundManager().play("bomb", this.getX(), this.getY());
        this.gamemode.getTeamCombatManager().addBomb(new Bomb(this.getBombBayX(), this.getBombBayY(), this.gamemode, this.getXVelocity(), this.getYVelocity(), this.gamemode.getNumTicks(), this.planeClass));
    }

     /*
        Method Name: displayHUD
        Method Parameters:
            displayTime:
                The current time in miliseconds
        Method Description: Display the HUD of the bomber plane
        Method Return: void
    */
    displayHUD(displayTime){
        let i = 0;
        for (let gun of this.guns){
            gun.displayHUD(displayTime - this.gamemode.getLastTickTime(), i);
            i++;
        }
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
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;

        // Calculate the interpolated coordinates
        this.calculateInterpolatedCoordinates(displayTime);

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Super call to remove (some) code repetition
        super.display(lX, bY, displayTime);
        
        // If dead don't display gun flashes
        if (this.isDead()){
            return;
        }
        // Display Props
        for (let prop of this.props){
            prop.display(lX, bY, displayTime);
        }
        
        // For each gun, if on shooting cooldown then show the flash image
        for (let gun of this.guns){
            // Don't display if ready to shoot
            if (gun.readyToShoot()){ continue; }

            // Display flash
            let rotateX = this.gamemode.getScene().getDisplayX(gun.getInterpolatedX(), 0, lX);
            let rotateY = this.gamemode.getScene().getDisplayY(gun.getInterpolatedY(), 0, bY);
            let interpolatedAngle = gun.getShootingAngle();
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

            // Game zoom
            scale(gameZoom, gameZoom);

            // Display flash
            displayImage(flashImage, 0 - flashImageWidth / 2,  0 - flashImageHeight / 2);

            // If facing left then turn around the display (reset)
            if (!this.isFacingRight()){
                scale(-1, 1);
            }

            // Undo game zoom
            scale(1/gameZoom, 1/gameZoom);
            
            // Reset the rotation and translation
            rotate(interpolatedAngle);
            translate(-1 * rotateX, -1 * rotateY);
        }
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BomberPlane;
}