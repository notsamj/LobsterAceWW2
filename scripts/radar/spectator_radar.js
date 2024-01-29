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
            this.placeOnRadar(entity.getX(), entity.getY(), FILE_DATA["team_to_colour"][planeModelToAlliance(entity.getPlaneClass())]);
        }
    }

    /*
        Method Name: placeOnRadar
        Method Parameters:
            enemyX:
                The x location of an enemy
            enemeyY:
                The y location of an enemy
            colour:
                Colour of radar blip

        Method Description: Places a plane on the radar
        Method Return: void
    */
    placeOnRadar(enemyX, enemyY, colour){
        let myX = this.entity.getX();
        let myY = this.entity.getY();
        let xOffsetAmount = Math.min(Math.floor(Math.abs(myX-enemyX)/this.blipDistance), (this.size - 2)/2);
        let yOffsetAmount = Math.min(Math.floor(Math.abs(myY-enemyY)/this.blipDistance), (this.size - 2)/2);
        if (enemyX < myX && enemyY > myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2-1-yOffsetAmount] = colour;
        }else if (enemyX < myX && enemyY < myY){
            this.radarData[this.size/2-1-xOffsetAmount][this.size/2+yOffsetAmount] = colour;
        }else if (enemyX > myX && enemyY < myY){
            this.radarData[this.size/2+xOffsetAmount][this.size/2+yOffsetAmount] = colour;
        }else{ // if (enemyX > myX && enemyY > myY)
            this.radarData[this.size/2+xOffsetAmount][this.size/2-1-yOffsetAmount] = colour;
        }
    }
}