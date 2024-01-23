/*
    Class Name: Radar
    Description: A radar showing positions of enemies.
*/
class Radar {
     /*
        Method Name: constructor
        Method Parameters:
            entity:
                The entity to whom the radar belongs
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(entity){
        this.size = FILE_DATA["radar"]["size"]; // MUST BE EVEN
        this.entity = entity;
        this.blipSize = FILE_DATA["radar"]["blip_size"];
        this.radarOutline = images["radar_outline"];
        this.radarBlip = images["radar_blip"];
        this.blipDistance = FILE_DATA["radar"]["blip_distance"];
        this.radarData = this.resetRadar();
    }

    getScreenX(){
        return getScreenWidth() - this.radarOutline.width-1;
    }

    getScreenY(){
        return 1;
    }

    // Abstract
    update(){}
    placeOnRadar(enemyX, enemyY){}
    resetRadar(){}
    display(){}
}