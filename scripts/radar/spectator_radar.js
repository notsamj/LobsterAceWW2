/*
    Class Name: PlaneRadar
    Description: A subclass of Radar. Specifically for the Spectator Camera.
*/
class SpectatorRadar extends Radar {
    /*
        Method Name: constructor
        Method Parameters:
            spectatorCamera:
                The spectator camera entity
            tickLockLength:
                The number of ticks between radar updates
            enabled:
                Whether or not the radar is enabled
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(spectatorCamera, tickLockLength, enabled=true){
        super(spectatorCamera, tickLockLength, enabled);
    }

    /*
        Method Name: update
        Method Parameters: None
        Method Description: Updates the radar
        Method Return: void
    */
    update(){
        this.resetRadar();
        for (let plane of this.entity.getGamemode().getTeamCombatManager().getLivingPlanes()){
            if (plane instanceof FighterPlane){
                this.placeOnRadar(plane.getX(), plane.getY(), PROGRAM_DATA["team_to_colour"]["fighter_plane"][planeModelToAlliance(plane.getPlaneClass())], this.fighterWeight);
            }else if (plane instanceof BomberPlane){
                this.placeOnRadar(plane.getX(), plane.getY(), PROGRAM_DATA["team_to_colour"]["bomber_plane"][planeModelToAlliance(plane.getPlaneClass())], this.bomberWeight);
            }
        }

        // Add all buildings to radar
        for (let [building, bI] of this.entity.getGamemode().getTeamCombatManager().getBuildings()){
            if (building.isDead()){ continue; }
            this.placeOnRadar(building.getCenterX(), building.getCenterY(), this.buildingColour, this.buildingWeight);
        }
    }
}