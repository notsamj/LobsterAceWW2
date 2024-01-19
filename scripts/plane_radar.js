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
            if (entity instanceof Plane && !onSameTeam(this.entity.getPlaneClass(), entity.getPlaneClass())){
                this.placeOnRadar(entity.getX(), entity.getY());
            }
        }
    }

    /*
        Method Name: placeOnRadar
        Method Parameters:
            enemyX:
                The x location of an enemy
            enemeyY:
                The y location of an enemy

        Method Description: Places an enemy on the radar
        Method Return: void
    */
    placeOnRadar(enemyX, enemyY){
        let myX = this.entity.getX();
        let myY = this.entity.getY();
        let xOffsetAmount = Math.min(Math.floor(Math.abs(myX-enemyX)/this.blipDistance), (this.size - 2)/2);
        let yOffsetAmount = Math.min(Math.floor(Math.abs(myY-enemyY)/this.blipDistance), (this.size - 2)/2);
        if (enemyX < myX && enemyY > myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2-1-yOffsetAmount] = true;
        }else if (enemyX < myX && enemyY < myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2+yOffsetAmount] = true;
        }else if (enemyX > myX && enemyY < myY){
            this.radarData[this.size/2+xOffsetAmount][this.size/2+yOffsetAmount] = true;
        }else{ // if (enemyX > myX && enemyY > myY)
            this.radarData[this.size/2+xOffsetAmount][this.size/2-1-yOffsetAmount] = true;
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
                newRow.push(false);
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
        drawingContext.drawImage(this.radarOutline, this.getScreenX(), this.getScreenY());
        let borderWidth = 2;
        for (let x = 0; x < this.size; x++){
            for (let y = 0; y < this.size; y++){
                if (this.radarData[x][y]){
                    drawingContext.drawImage(this.radarBlip, this.getScreenX() + borderWidth + this.blipSize * x, this.getScreenY() + borderWidth + this.blipSize * y);
                }
            }
        }
    }
}