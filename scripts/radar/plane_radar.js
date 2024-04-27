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
            tickLockLength:
                The number of ticks between radar updates
            enabled:
                Whether or not the radar is enabled
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(plane, tickLockLength, enabled=true){
        super(plane, tickLockLength, enabled);
        this.plane = plane;
    }
    
    /*
        Method Name: update
        Method Parameters: None
        Method Description: Updates the radar
        Method Return: void
    */
    update(){
        this.resetRadar();
        // All planes to radar. Enemy fighters, enemy bombers, friendly bombers. Ignore friendly fighters.
        for (let plane of this.plane.getTeamCombatManager().getLivingPlanes()){
            if (plane instanceof FighterPlane && !onSameTeam(this.plane.getPlaneClass(), plane.getPlaneClass())){
                this.placeOnRadar(plane.getX(), plane.getY(), this.enemyFighterColour, this.enemyFighterWeight);
            }else if (plane instanceof FighterPlane && onSameTeam(this.plane.getPlaneClass(), plane.getPlaneClass())){
                this.placeOnRadar(plane.getX(), plane.getY(), this.friendlyFighterColour, this.friendlyFighterWeight);
            }else if (plane instanceof BomberPlane && !onSameTeam(this.plane.getPlaneClass(), plane.getPlaneClass())){
                this.placeOnRadar(plane.getX(), plane.getY(), this.enemyBomberColour, this.enemyBomberWeight);
            }else if (plane instanceof BomberPlane && onSameTeam(this.plane.getPlaneClass(), plane.getPlaneClass())){
                this.placeOnRadar(plane.getX(), plane.getY(), this.friendlyBomberColour, this.enemyBomberWeight);
            }
        }

        // Add all buildings to radar
        for (let [building, bI] of this.plane.getGamemode().getTeamCombatManager().getBuildings()){
            if (building.isDead()){ continue; }
            this.placeOnRadar(building.getCenterX(), building.getCenterY(), this.buildingColour, this.buildingWeight);
        }
    }
}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = PlaneRadar;
}