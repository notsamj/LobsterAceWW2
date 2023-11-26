var images = {};

function loadRotatedImages(name){
    for (let i = 0; i < 360; i++){
        images[name + "_left_" + i.toString()] = new Image();
        images[name + "_left_" + i.toString()].src = "images/" + name + "/left/" + i.toString() + ".png";
        images[name + "_right_" + i.toString()] = new Image();
        images[name + "_right_" + i.toString()].src = "images/" + name + "/right/" + i.toString() + ".png";
    }
}

class Scene{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.nextEntityID = 0;
        this.entities = [];
        this.focusedEntityIndex = -1;
    }

    display(){
        let lX = 0; // Bottom left x
        let bY = 0; // Bottom left y
        // If 
        if (this.hasEntityFocused()){
            let focusedEntity = this.getFocusedEntity();
            lX = focusedEntity.getCenterX() - (this.width) / 2;
            bY = focusedEntity.getCenterY() - (this.height) / 2;
        }
        for (let entity of this.entities){
            this.displayEntity(entity, lX, bY);
        }
    }

    changeToScreenX(x){
        return x; // Doesn't need to be changed ATM
    }

    changeToScreenY(y){
        return this.height - y;
    }

    addEntity(entity){
        entity.setID(this.nextEntityID++);
        this.entities.push(entity);
        if (!this.hasEntityFocused()){
            this.focusedEntityIndex = this.nextEntityID - 1;
        }
    } 

    displayEntity(entity, lX, bY){
        let rX = lX + this.width - 1;
        let tY = bY + this.height - 1;
        // Is on screen
        if (!entity.touchesRegion(lX, rX, bY, tY)){ return; }

        let displayX = entity.getCenterX() - entity.getWidth() / 2;
        let displayY = entity.getCenterY() - entity.getWidth() / 2;
        displayX = Math.round(displayX);
        displayY = Math.round(displayY);

        displayX = this.changeToScreenX(displayX);
        displayY = this.changeToScreenY(displayY);

        drawingContext.drawImage(entity.getImage(), Math.round(displayX), Math.round(displayY)); 
    }

    hasEntityFocused(){
        return this.focusedEntityIndex != -1;
    }

    getFocusedEntity(){
        return this.entities[this.focusedEntityIndex];
    }
}