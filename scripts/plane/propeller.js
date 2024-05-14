/*
    Class Name: Propeller
    Description: Represents a plane propeller
*/
class Propeller {
    constructor(plane, propellerData){
        this.plane = plane;
        this.numBlades = propellerData["num_blades"];
        this.radius = propellerData["radius"];
        this.radOffset = Math.random() * 2 * Math.PI;
        this.rpm = propellerData["rpm"];
        this.xOffset = propellerData["x_offset"];
        this.yOffset = propellerData["y_offset"];
        this.lastDisplayTime = Date.now();
    }

    /*
        Method Name: getInterpolatedX
        Method Parameters: None
        Method Description: Determine the x location of the propeller
        Method Return: Number
    */
    getInterpolatedX(){
        let planeAngleRAD = this.plane.getInterpolatedAngle();
        let rotatedX = Math.cos(planeAngleRAD) * (this.xOffset * (this.plane.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * this.yOffset + this.plane.getInterpolatedX();
        return rotatedX;
    }

    /*
        Method Name: getInterpolatedY
        Method Parameters: None
        Method Description: Determine the y location of the propeller
        Method Return: Number
    */
    getInterpolatedY(){
        let planeAngleRAD = this.plane.getInterpolatedAngle();
        let rotatedY = Math.sin(planeAngleRAD) * (this.xOffset * (this.plane.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * this.yOffset + this.plane.getInterpolatedY();
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
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;

        // Determine top and bottom pixels
        let topPixels = 0;
        let bottomPixels = 0;
        let angleBetweenEachBlade = Math.PI * 2 / this.numBlades;
        for (let i = 0; i < this.numBlades; i++){
            let bladeAngle = fixRadians(i * angleBetweenEachBlade + this.radOffset);
            let bladeAmount = Math.abs(Math.sin(bladeAngle)) * this.radius;
            // If top
            if (bladeAngle < Math.PI){
                topPixels = Math.max(topPixels, bladeAmount);
            }else{ // Else bottom
                bottomPixels = Math.max(bottomPixels, bladeAmount);
            }
        }
        
        // Rotate
        let timeSinceLastUpdate = displayTime - this.lastDisplayTime;
        this.lastDisplayTime = displayTime;
        this.radOffset = fixRadians(this.radOffset + this.rpm * this.plane.getThrottle() / 100 * 2 * Math.PI  * (timeSinceLastUpdate / (1000 * 60 * 60)));

        // Determine prop screen position
        let displayX = this.plane.getGamemode().getScene().getDisplayX(this.getInterpolatedX(), 0, lX);
        let displayY = this.plane.getGamemode().getScene().getDisplayY(this.getInterpolatedY(), 0, bY);
        let rotateX = displayX;
        let rotateY = displayY;
        let interpolatedAngle = this.plane.getInterpolatedAngle();

        // Prepare the display
        translate(rotateX, rotateY);
        rotate(-1 * interpolatedAngle);

        // If facing left then turn around the display
        if (!this.plane.isFacingRight()){
            scale(-1, 1);
        }

        // Game scale
        scale(gameZoom, gameZoom);

        // Display prop
        noStrokeRectangle(Colour.fromCode("#000000"), 0, -1 * topPixels, 1, topPixels + 1 + bottomPixels);

        // Undo game zoom scale
        scale(1/gameZoom, 1/gameZoom);

        // If facing left then turn around the display (reset)
        if (!this.plane.isFacingRight()){
            scale(-1, 1);
        }
        // Reset the rotation and translation
        rotate(interpolatedAngle);
        translate(-1 * rotateX, -1 * rotateY);
    }
}