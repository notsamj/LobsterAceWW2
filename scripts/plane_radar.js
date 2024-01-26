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
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2-1-yOffsetAmount] = "red";
        }else if (enemyX < myX && enemyY < myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2+yOffsetAmount] = "red";
        }else if (enemyX > myX && enemyY < myY){
            this.radarData[this.size/2+xOffsetAmount][this.size/2+yOffsetAmount] = "red";
        }else{ // if (enemyX > myX && enemyY > myY)
            this.radarData[this.size/2+xOffsetAmount][this.size/2-1-yOffsetAmount] = "red";
        }
    }
}