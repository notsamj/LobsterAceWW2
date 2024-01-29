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
        this.blipDistance = FILE_DATA["radar"]["blip_distance"];
        this.radarData = this.resetRadar();
    }

    // TODO: Comments on these functions
    getScreenX(){
        return getScreenWidth() - this.radarOutline.width-1;
    }

    getScreenY(){
        return 1;
    }

    drawRectangle(colour, screenX, screenY){
        fill(colour);
        rect(screenX, screenY, this.blipSize, this.blipSize);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the radar on the screen
        Method Return: void
    */
    display(){
        drawingContext.drawImage(this.radarOutline, this.getScreenX(), this.getScreenY());
        let borderWidth = FILE_DATA["radar"]["border_width"];
        for (let x = 0; x < this.size; x++){
            for (let y = 0; y < this.size; y++){
                if (this.radarData[x][y] == null){ continue; }
                this.drawRectangle(this.radarData[x][y], this.getScreenX() + borderWidth + this.blipSize * x, this.getScreenY() + borderWidth + this.blipSize * y);
            }
        }
    }

    /*
        Method Name: resetRadar
        Method Parameters: None
        Method Description: Resets the radar
        Method Return: void
    */
    resetRadar(){
        let array2D = [];
        for (let i = 0; i < this.size; i++){
            let newRow = [];
            for (let j = 0; j < this.size; j++){
                newRow.push(null);
            }
            array2D.push(newRow);
        }
        return array2D;
    }

    // Abstract
    update(){}
    placeOnRadar(enemyX, enemyY){}
}