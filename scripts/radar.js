class Radar{
    constructor(plane){
        this.size = fileData["radar"]["size"]; // MUST BE EVENT
        this.blipSize = fileData["radar"]["blip_size"];
        this.radarOutline = images["radar_outline"];
        this.screenX = fileData["constants"]["CANVAS_WIDTH"] - this.radarOutline.width-1;
        this.screenY = 1;
        this.radarBlip = images["radar_blip"];
        this.blipDistance = fileData["radar"]["blip_distance"];
        this.friendlyBlip = images["radar_blip_friendly"];
        this.radarData = this.resetRadar();
        this.plane = plane;
    }

    update(){
        this.radarData = this.resetRadar();
        for (let entity of scene.getEntities()){
            if (entity instanceof Plane && !onSameTeam(this.plane.getPlaneClass(), entity.getPlaneClass())){
                this.placeOnRadar(entity.getX(), entity.getY());
            }
        }
    }

    placeOnRadar(enemyX, enemyY){
        let myX = this.plane.getX();
        let myY = this.plane.getY();
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

    display(){
        drawingContext.drawImage(this.radarOutline, this.screenX, this.screenY);
        let borderWidth = 2;
        for (let x = 0; x < this.size; x++){
            for (let y = 0; y < this.size; y++){
                if (this.radarData[x][y]){
                    drawingContext.drawImage(this.radarBlip, this.screenX + borderWidth + this.blipSize * x, this.screenY + borderWidth + this.blipSize * y);
                }
            }
        }
        //drawingContext.drawImage(this.friendlyBlip, this.screenX + borderWidth + (this.size / 2 - 2) * this.blipSize, this.screenY + borderWidth + (this.size / 2 - 2) * this.blipSize);
    }
}