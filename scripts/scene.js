if (typeof window === "undefined"){
    NotSamLinkedList = require("../scripts/notsam_linked_list.js");
}

var images = {};

async function loadLocalImage(url){
    let newImage = null;
    let wait = new Promise(function(resolve, reject){
        newImage = new Image();
        newImage.onload = function(){
            resolve();
        }
        newImage.onerror = function(){
            reject();
        }
        newImage.src = url;
    });
    await wait;
    return newImage;
}

async function loadToImages(imageName, type=".png"){
    images[imageName] = await loadLocalImage("images/" + imageName + type);
}

class Scene{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.nextEntityID = 0;
        this.entities = new NotSamLinkedList();
        this.focusedEntity = null;
        this.ticksEnabled = false;
        this.displayEnabled = false;
    }

    getEntities(){
        return this.entities;
    }

    display(){
        if (!this.displayEnabled){ return; }
        let lX = 0; // Bottom left x
        let bY = 0; // Bottom left y
        let focusedEntity = null;
        // If 
        if (this.hasEntityFocused()){
            focusedEntity = this.getFocusedEntity();
            lX = focusedEntity.getCenterX() - (this.width) / 2;
            bY = focusedEntity.getCenterY() - (this.height) / 2;
        }
        this.displayBackground(lX, bY);
        for (let [entity, entityIndex] of this.entities){
            if (this.hasEntityFocused() && entity.getID() == focusedEntity.getID()){ continue; }
            this.displayEntity(entity, lX, bY);
        }

        if (this.hasEntityFocused()){
            this.displayEntity(focusedEntity, lX, bY);
        }
    }

    // Abstract
    displayBackground(){}

    setFocusedEntity(entity){
        this.focusedEntity = entity;
    }

    changeToScreenX(x){
        return x; // Doesn't need to be changed ATM
    }

    changeToScreenY(y){
        return this.height - y;
    }

    addEntity(entity, idSet=false){
        if (!idSet){
            entity.setID(this.nextEntityID++);
        }else{
            this.nextEntityID = Math.max(this.nextEntityID+1, entity.getID() + 1);
        }
        this.entities.push(entity);
    } 
    
    delete(entityID){
        // No focused entity anmore 
        if (entityID == this.focusedEntity.getID()){
            this.setFocusedEntity(-1);
        }
        let foundIndex = -1;
        for (let [entity, entityIndex] of this.entities){
            if (entity.getID() == entityID){
                foundIndex = entityIndex;
                break;
            }
        }
        if (foundIndex == -1){
            console.error("Failed to find entity that should be deleted:", entityID);
            debugger;
            return; 
        }
        this.entities.remove(foundIndex);
    }

    displayEntity(entity, lX, bY){
        if (entity.isDead()){ return; }
        let rX = lX + this.width - 1;
        let tY = bY + this.height - 1;
        // Is on screen
        if (!entity.touchesRegion(lX, rX, bY, tY)){ return; }
        let displayX = this.getDisplayX(entity.getCenterX(), entity.getWidth(), lX);
        let displayY = this.getDisplayY(entity.getCenterY(), entity.getHeight(), bY);

        if (entity.canRotate()){
            let rotateX = displayX + entity.getWidth() / 2;
            let rotateY = displayY + entity.getHeight() / 2;
            translate(rotateX, rotateY);
            rotate(-1 * toRadians(entity.getAngle()));
            if (!entity.isFacingRight()){
                scale(-1, 1);
            }
            drawingContext.drawImage(entity.getImage(), 0 - entity.getWidth() / 2, 0 - entity.getHeight() / 2); 
            if (!entity.isFacingRight()){
                scale(-1, 1);
            }
            rotate(toRadians(entity.getAngle()));
            translate(-1 * rotateX, -1 * rotateY);
            return;
        }else{
            drawingContext.drawImage(entity.getImage(), displayX, displayY); 
        }
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
        return this.focusedEntity != null;
    }

    getEntity(id){
        for (let [entity, entityIndex] of this.entities){
            if (entity.getID() == id){ return entity; }
        }
        return null;
    }

    hasEntity(id){
        return this.getEntity(id) != null;
    }

    getFocusedEntity(){
        return this.focusedEntity;
    }

    enable(){
        this.enableTicks();
        this.enableDisplay();
    }

    disable(){
        this.disableTicks();
        this.disableDisplay();
    }

    enableTicks(){
        this.ticksEnabled = true;
    }

    disableTicks(){
        this.ticksEnabled = false;
    }

    enableDisplay(){
        this.displayEnabled = true;
    }

    disableDisplay(){
        this.displayEnabled = false;
    }

    tick(timeDiff){
        if (!this.ticksEnabled){ return; }
        for (let [entity, entityIndex] of this.entities){
            if (entity.isDead()){ continue; }
            entity.tick(timeDiff);
        }

        this.checkCollisions(timeDiff);
    }

    getNumberOfEntities(){
        return this.entities.getLength();
    }

    getGoodToFollowEntities(){
        let entities = this.getEntities();
        let followableEntities = [];
        
        // Get followable entities
        for (let entity of entities){
            if (entity.goodToFollow()){
                followableEntities.push(entity);
            }
        }
        return followableEntities;
    }

    setEntities(entities, idsSet=false){
        this.entities = new NotSamLinkedList();
        for (let entity of entities){
            this.addEntity(entity, idsSet);
        }
    }

    // Abstract
    checkCollisions(timeDiff){}
}
if (typeof window === "undefined"){
    module.exports = Scene;
}