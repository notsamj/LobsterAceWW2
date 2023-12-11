class SpectatorRadar extends Radar{
    constructor(entity){
        super(entity);
        this.friendlyBlip = images["radar_blip_friendly"];
    }

    update(){
        this.radarData = this.resetRadar();
        for (let entity of scene.getEntities()){
            if (entity instanceof Plane){
                this.placeOnRadar(entity.getX(), entity.getY(), (planeModelToAlliance(entity.getPlaneClass()) == "Allies") ? 1 : -1);
            }
        }
    }

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
        //drawingContext.drawImage(this.friendlyBlip, this.screenX + borderWidth + (this.size / 2 - 2) * this.blipSize, this.screenY + borderWidth + (this.size / 2 - 2) * this.blipSize);
    }
}