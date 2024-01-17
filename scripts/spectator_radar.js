/*
    Class Name: PlaneRadar
    Description: A subclass of Radar. Specifically for the Spectator Camera.
*/
class SpectatorRadar extends Radar {
    /*
        Method Name: constructor
        Method Parameters:
            entity:
                The spectator camera entity
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(entity){
        super(entity);
        this.friendlyBlip = images["radar_blip_friendly"];
    }

    /*
        Method Name: update
        Method Parameters: None
        Method Description: Updates the radar
        Method Return: void
    */
    update(){
        this.radarData = this.resetRadar();
        for (let entity of scene.getPlanes()){
            this.placeOnRadar(entity.getX(), entity.getY(), (planeModelToAlliance(entity.getPlaneClass()) == "Allies") ? 1 : -1);
        }
    }

    /*
        Method Name: placeOnRadar
        Method Parameters:
            enemyX:
                The x location of an enemy
            enemeyY:
                The y location of an enemy
            value:
                1 for ally plane, -1 for axis

        Method Description: Places a plane on the radar
        Method Return: void
    */
    placeOnRadar(enemyX, enemyY, value){
        let myX = this.entity.getX();
        let myY = this.entity.getY();
        let xOffsetAmount = Math.min(Math.floor(Math.abs(myX-enemyX)/this.blipDistance), (this.size - 2)/2);
        let yOffsetAmount = Math.min(Math.floor(Math.abs(myY-enemyY)/this.blipDistance), (this.size - 2)/2);
        if (enemyX < myX && enemyY > myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2-1-yOffsetAmount] = value;
        }else if (enemyX < myX && enemyY < myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2+yOffsetAmount] = value;
        }else if (enemyX > myX && enemyY < myY){
            this.radarData[this.size/2+xOffsetAmount][this.size/2+yOffsetAmount] = value;
        }else{ // if (enemyX > myX && enemyY > myY)
            this.radarData[this.size/2+xOffsetAmount][this.size/2-1-yOffsetAmount] = value;
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
                newRow.push(0);
            }
            array2D.push(newRow);
        }
        return array2D;
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the radar on the screen
        Method Return: void
    */
    display(){
        drawingContext.drawImage(this.radarOutline, this.screenX, this.screenY);
        let borderWidth = 2;
        for (let x = 0; x < this.size; x++){
            for (let y = 0; y < this.size; y++){
                if (this.radarData[x][y] == -1){
                    drawingContext.drawImage(this.radarBlip, this.screenX + borderWidth + this.blipSize * x, this.screenY + borderWidth + this.blipSize * y);
                }else if (this.radarData[x][y] == 1){
                    drawingContext.drawImage(this.friendlyBlip, this.screenX + borderWidth + this.blipSize * x, this.screenY + borderWidth + this.blipSize * y);
                }
            }
        }
    }
}