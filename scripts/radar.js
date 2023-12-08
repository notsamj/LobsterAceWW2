class Radar{
    constructor(entity){
        this.size = fileData["radar"]["size"]; // MUST BE EVEN
        this.entity = entity;
        this.blipSize = fileData["radar"]["blip_size"];
        this.radarOutline = images["radar_outline"];
        this.screenX = fileData["constants"]["CANVAS_WIDTH"] - this.radarOutline.width-1;
        this.screenY = 1;
        this.radarBlip = images["radar_blip"];
        this.blipDistance = fileData["radar"]["blip_distance"];
        this.radarData = this.resetRadar();
    }

    // Abstract
    update(){}
    placeOnRadar(enemyX, enemyY){}
    resetRadar(){}
    display(){}
}