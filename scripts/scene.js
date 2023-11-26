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
        this.backgroundImage = new Image();
        this.backgroundImage.src = "";
    }

    setBackground(imageName){
        this.backgroundImage.src = "images/" + imageName + ".png";
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
        //console.log(lX, bY)
        this.displayBackground(lX, bY);
        for (let entity of this.entities){
            this.displayEntity(entity, lX, bY);
        }
    }

    displayBackground(lX, bY){
        let x2 = 0;
        let y2 = 0;
        while (x2 < lX){
            x2 += this.backgroundImage.width;
        }
        while (y2 < bY){
            y2 += this.backgroundImage.height;
        }

        let x1 = x2 - this.backgroundImage.width;
        let y1 = y2 - this.backgroundImage.height;
        // Bottom-Left
        let displayX = this.getDisplayX(x1 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        let displayY = this.getDisplayY(y1 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);

        // Bottom_Right
        displayX = this.getDisplayX(x2 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        displayY = this.getDisplayY(y1 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);

        // Top Left
        displayX = this.getDisplayX(x1 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        displayY = this.getDisplayY(y2 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);
        
        // Top Right
        displayX = this.getDisplayX(x2 + this.backgroundImage.width / 2, this.backgroundImage.width, lX);
        displayY = this.getDisplayY(y2 + this.backgroundImage.height / 2, this.backgroundImage.height, bY);
        drawingContext.drawImage(this.backgroundImage, displayX, displayY);
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

        let displayX = this.getDisplayX(entity.getCenterX(), entity.getWidth(), lX);
        let displayY = this.getDisplayY(entity.getCenterY(), entity.getHeight(), bY);

        drawingContext.drawImage(entity.getImage(), displayX, displayY); 
    }

    getDisplayX(centerX, width, lX){
        // Change coordinate system
        let displayX = this.changeToScreenX(centerX);

        // Find relative to bottom left corner
        displayX = displayX - lX;

        // Find top left corner
        displayX = displayX - width / 2;

        // Round to nearest pixel
        displayX = Math.round(displayX);
        return displayX;
    }

    getDisplayY(centerY, height, bY){
        // Change coordinate system
        let displayY = this.changeToScreenY(centerY);

        // Find relative to bottom left corner
        displayY = displayY + bY;

        // Find top left corner
        displayY = displayY - height / 2;

        // Round to nearest pixel
        displayY = Math.round(displayY);
        return displayY;
    }

    hasEntityFocused(){
        return this.focusedEntityIndex != -1;
    }

    getFocusedEntity(){
        return this.entities[this.focusedEntityIndex];
    }

    tick(timeDiff){
        for (let entity of this.entities){
            entity.tick(timeDiff);
        }
    }
}