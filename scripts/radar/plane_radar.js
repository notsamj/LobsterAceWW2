// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    FighterPlane = require("../plane/fighter_plane/fighter_plane.js");
    helperFunctions = require("../general/helper_functions.js");
    onSameTeam = helperFunctions.onSameTeam;
    Radar = require("./radar.js");
}
/*
    Class Name: PlaneRadar
    Description: A subclass of Radar. Specifically for planes.
*/
class PlaneRadar extends Radar {
    /*
        Method Name: constructor
        Method Parameters:
            plane:
                The plane to whom the radar belongs
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(plane){
        super(plane);
        this.plane = plane;
    }
    
    /*
        Method Name: update
        Method Parameters: None
        Method Description: Updates the radar
        Method Return: void
    */
    update(){
        this.radarData = this.resetRadar();
        // All planes to radar. Enemy fighters, enemy bombers, friendly bombers. Ignore friendly fighters.
        for (let plane of this.plane.getTeamCombatManager().getLivingPlanes()){
            if (plane instanceof FighterPlane && !onSameTeam(this.plane.getPlaneClass(), plane.getPlaneClass())){
                this.placeOnRadar(plane.getX(), plane.getY(), "#db655c");
            }else if (plane instanceof BomberPlane && !onSameTeam(this.plane.getPlaneClass(), plane.getPlaneClass())){
                this.placeOnRadar(plane.getX(), plane.getY(), "#a6140a");
            }else if (plane instanceof BomberPlane && onSameTeam(this.plane.getPlaneClass(), plane.getPlaneClass())){
                this.placeOnRadar(plane.getX(), plane.getY(), "#26940a");
            }
        }

        // Add all buildings to radar
        for (let [building, bI] of this.plane.getGamemode().getTeamCombatManager().getBuildings()){
            if (building.isDead()){ continue; }
            this.placeOnRadar(building.getCenterX(), building.getCenterY(), "#919191");
        }
    }

    /*
        Method Name: placeOnRadar
        Method Parameters:
            objectX:
                The x location of an object
            objectY:
                The y location of an object
            colour:
                Colour of object placed on radar
        Method Description: Places an object on the radar
        Method Return: void
    */
    placeOnRadar(objectX, objectY, colour){
        let myX = this.entity.getX();
        let myY = this.entity.getY();
        let xOffsetAmount = Math.min(Math.floor(Math.abs(myX-objectX)/this.blipDistance), (this.size - 2)/2);
        let yOffsetAmount = Math.min(Math.floor(Math.abs(myY-objectY)/this.blipDistance), (this.size - 2)/2);
        if (objectX < myX && objectY >= myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2-1-yOffsetAmount] = colour;
        }else if (objectX < myX && objectY < myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2+yOffsetAmount] = colour;
        }else if (objectX >= myX && objectY < myY){
            this.radarData[this.size/2+xOffsetAmount][this.size/2+yOffsetAmount] = colour;
        }else{ // if (objectX >= myX && objectY >= myY)
            this.radarData[this.size/2+xOffsetAmount][this.size/2-1-yOffsetAmount] = colour;
        }
    }
}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = PlaneRadar;
}