// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    NotSamLinkedList = require("../scripts/notsam_linked_list.js");
}

var images = {};

/*
    Method Name: loadLocalImage
    Method Parameters:
        url:
           Url of an image
    Method Description: Loads an image an returns it
    Method Return: Image
*/
async function loadLocalImage(url){
    console.log("Loading image", url);
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

/*
    Method Name: loadToImages
    Method Parameters:
        imageName:
            Name of an image (String)
        type:
            File extension of an image
    Method Description: Loads an image and saves it to a global variable
    Method Return: void
*/
async function loadToImages(imageName, type=".png"){
    images[imageName] = await loadLocalImage("images/" + imageName + type);
}

/*
    Class Name: Scene
    Description: A scene including entities and a background.
*/
class Scene {
    /*
        Method Name: constructor
        Method Parameters:
            width:
                The width of the canvas
            height:
                The height of the canvas
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.nextEntityID = 0;
        this.entities = new NotSamLinkedList();
        this.focusedEntity = null;
        this.ticksEnabled = false;
        this.displayEnabled = false;
    }

    /*
        Method Name: getEntities
        Method Parameters: None
        Method Description: Getter
        Method Return: NotSamLinkedList of entities
    */
    getEntities(){
        return this.entities;
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display all the entities and the background
        Method Return: void
    */
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

    /*
        Method Name: setFocusedEntity
        Method Parameters: 
            entity:
                An entity to focus on
        Method Description: Set the focus of the scene to a particular entity
        Method Return: void
    */
    setFocusedEntity(entity){
        this.focusedEntity = entity;
    }

    /*
        Method Name: changeToScreenX
        Method Parameters: 
            x:
                An x coordinate in the game coordinate system
        Method Description: Transforms an game x to a screen x
        Method Return: float
    */
    changeToScreenX(x){
        return x; // Doesn't need to be changed ATM
    }

    /*
        Method Name: changeToScreenY
        Method Parameters: 
            y:
                An y coordinate in the game coordinate system
        Method Description: Transforms an game y to a screen y
        Method Return: float
    */
    changeToScreenY(y){
        return this.height - y;
    }

    /*
        Method Name: addEntity
        Method Parameters: 
            entity:
                An entity to be added
            idSet:
                Boolean, whether or not the id is already set for this entity
        Method Description: Set the focus of the scene to a particular entity
        Method Return: void
    */
    addEntity(entity, idSet=false){
        if (!idSet){
            entity.setID(this.nextEntityID++);
        }else{
            this.nextEntityID = Math.max(this.nextEntityID+1, entity.getID() + 1);
        }
        this.entities.push(entity);
    } 
    
    /*
        Method Name: entityID
        Method Parameters: 
            entityID:
                The id of an entity to be deleted
        Method Description: Removes an entity from the scene
        Method Return: void
    */
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

    /*
        Method Name: displayEntity
        Method Parameters:
            entity:
                The entity to display
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays an entity on the screen (if it is within the bounds)
        Method Return: void
    */
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

    /*
        Method Name: getDisplayX
        Method Parameters:
            centerX:
                The x coordinate at the center of the screen
            width:
                The width of the entity
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
        Method Description: Determines the top left corner where an image should be displayed
        Method Return: int
    */
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

    /*
        Method Name: getDisplayY
        Method Parameters:
            centerY:
                The y coordinate at the center of the screen
            width:
                The width of the entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Determines the top left corner where an image should be displayed
        Method Return: int
    */
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

    /*
        Method Name: hasEntityFocused
        Method Parameters: None
        Method Description: Determines whether there is currently a focused entity
        Method Return: boolean, true -> there is an entity focused, false -> there is no entity focused
    */
    hasEntityFocused(){
        return this.focusedEntity != null;
    }

    /*
        Method Name: hasEntityFocused
        Method Parameters:
            id:
                The id of the entity being searched for
        Method Description: Finds an entity from an id
        Method Return: Entity
    */
    getEntity(id){
        for (let [entity, entityIndex] of this.entities){
            if (entity.getID() == id){ return entity; }
        }
        return null;
    }

    /*
        Method Name: hasEntity
        Method Parameters:
            id:
                The id of the entity being searched for
        Method Description: Finds out if an entity exists
        Method Return: boolean, true -> has entity, false -> does not have entity
    */
    hasEntity(id){
        return this.getEntity(id) != null;
    }

    /*
        Method Name: getFocusedEntity
        Method Parameters: None
        Method Description: Getter
        Method Return: Entity
    */
    getFocusedEntity(){
        return this.focusedEntity;
    }

    /*
        Method Name: enable
        Method Parameters: None
        Method Description: Enables every aspect of the scene
        Method Return: void
    */
    enable(){
        this.enableTicks();
        this.enableDisplay();
    }

    /*
        Method Name: disable
        Method Parameters: None
        Method Description: Disables every aspect of the scene
        Method Return: void
    */
    disable(){
        this.disableTicks();
        this.disableDisplay();
    }

    /*
        Method Name: enableTicks
        Method Parameters: None
        Method Description: Enables ticks for the scene
        Method Return: void
    */
    enableTicks(){
        this.ticksEnabled = true;
    }

    /*
        Method Name: disableTicks
        Method Parameters: None
        Method Description: Disables ticks for the scene
        Method Return: void
    */
    disableTicks(){
        this.ticksEnabled = false;
    }

    /*
        Method Name: enableDisplay
        Method Parameters: None
        Method Description: Enables display for the scene
        Method Return: void
    */
    enableDisplay(){
        this.displayEnabled = true;
    }

    /*
        Method Name: disableDisplay
        Method Parameters: None
        Method Description: Disables display for the scene
        Method Return: void
    */
    disableDisplay(){
        this.displayEnabled = false;
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiff:
                Time between ticks
        Method Description: Makes things happen within a tick
        Method Return: void
    */
    tick(timeDiff){
        if (!this.ticksEnabled){ return; }
        for (let [entity, entityIndex] of this.entities){
            if (entity.isDead()){ continue; }
            entity.tick(timeDiff);
        }

        this.checkCollisions(timeDiff);
    }

    /*
        Method Name: getNumberOfEntities
        Method Parameters: None
        Method Description: Determines the number of entities that exist
        Method Return: int
    */
    getNumberOfEntities(){
        return this.entities.getLength();
    }

    /*
        Method Name: getGoodToFollowEntities
        Method Parameters: None
        Method Description: Makes a list of all entities that are "good to follow" and return it
        Method Return: Array of enities
    */
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

    /*
        Method Name: setEntities
        Method Parameters:
            entities:
                A list of entities
            idsSet:
                Whether the ids are already set or need to be
        Method Description: Removes all planes and adds a bunch of entities
        Method Return: void
    */
    setEntities(entities, idsSet=false){
        this.entities = new NotSamLinkedList();
        for (let entity of entities){
            this.addEntity(entity, idsSet);
        }
    }

    // Abstract
    checkCollisions(timeDiff){}
}
// If using NodeJS -> export the class
if (typeof window === "undefined"){
    module.exports = Scene;
}