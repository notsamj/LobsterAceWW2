// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PlaneRadar = require("./plane_radar.js");
}
/*
    Class Name: BomberPlaneRadar
    Description: A subclass of PlaneRadar. Specifically for bomber planes.
*/
class BomberPlaneRadar extends PlaneRadar {
    /*
        Method Name: constructor
        Method Parameters:
            plane:
                The plane to whom the radar belongs
            tickLockLength:
                The number of ticks between radar updates
            enabled:
                Whether or not the radar is enabled
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(plane, tickLockLength, enabled=true){
        super(plane, tickLockLength, enabled);
    }
    
    /*
        Method Name: update
        Method Parameters: None
        Method Description: Updates the radar
        Method Return: void
    */
    update(){
        super.update();
        // Place a dot where the bomb would be expected to hit if dropped now
        this.placeOnRadar(this.plane.getBombHitX(), 0, this.bombHitLocationColour, this.bombHitLocationWeight);
    }
}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = BomberPlaneRadar;
}