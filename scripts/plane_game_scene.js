// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Scene = require("../scripts/scene.js");
    TeamCombatManager = require("../scripts/team_combat_manager.js");
}
/*
    Method Name: loadRotatedImages
    Method Parameters:
        name:
           image name
    Method Description: Loads all the images of a given plane.
    Method Return: void
    Note: This is a relic from when planes has 720 images. It should be redone.
*/
async function loadRotatedImages(name){
    images[name] = await loadLocalImage("images/" + name + "/" + name + ".png");
}

/*
    Method Name: loadPlanes
    Method Parameters: None
    Method Description: Loads all the images of all planes.
    Method Return: void
    Note: This is a relic from when planes has 720 images and took a long time to load. It should be redone.
*/
async function loadPlanes(){
    let numPlanes = Object.entries(FILE_DATA["plane_data"]).length;
    let i = 0;
    for (const [planeName, planeDetails] of Object.entries(FILE_DATA["plane_data"])) {
        loadedPercent = Math.round(i / numPlanes * 100);
        await loadRotatedImages(planeName);
        i += 1;
    }
}
/*
    Class Name: PlaneGameScene
    Description: A subclass of Scene. Specifically for the WW2 Plane Game.
*/
class PlaneGameScene extends Scene {
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
        super(width, height);
        this.collisionsEnabled = true;
        this.teamCombatManager = new TeamCombatManager(FILE_DATA["teams"]);
    }

    /*
        Method Name: forceUpdatePlanes
        Method Parameters:
            listOfPlaneObjects:
                A list of all the plane json objects providing information on plane stats
        Method Description: Forcefully updates all the planes
        Method Return: void
    */
    forceUpdatePlanes(listOfPlaneObjects){
        this.teamCombatManager.forceUpdatePlanes(listOfPlaneObjects);
    }

    /*
        Method Name: enableCollisions
        Method Parameters: None
        Method Description: Set the property of collisions being enabled to true
        Method Return: void
    */
    enableCollisions(){
        this.collisionsEnabled = true;
    }

    /*
        Method Name: disableCollisions
        Method Parameters: None
        Method Description: Set the property of collisions being enabled to false
        Method Return: void
    */
    disableCollisions(){
        this.collisionsEnabled = false;
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
        
        // Get followable entities (entities doesn't include planes at the moment)
        for (let [entity, entityIndex] of entities){
            if (entity.goodToFollow()){
                followableEntities.push(entity);
            }
        }
        for (let plane of this.teamCombatManager.getAllPlanes()){
            followableEntities.push(plane);
        }
        return followableEntities;
    }

    /*
        Method Name: getPlanes
        Method Parameters: None
        Method Description: Gets all the planes and returns them
        Method Return: Array of planes
    */
    getPlanes(){
        return this.teamCombatManager.getAllPlanes();
    }

    /*
        Method Name: getBullets
        Method Parameters: None
        Method Description: Gets all the bullets and returns them
        Method Return: Array of bullets
    */
    getBullets(){
        return this.teamCombatManager.getAllBullets(); 
    }

    /*
        Method Name: setEntities
        Method Parameters:
            entities:
                A list of entities
        Method Description: Removes all planes and adds a bunch of entities
        Method Return: void
    */
    setEntities(entities){
        this.teamCombatManager.clear();
        for (let entity of entities){
            if (entity instanceof Plane || entity instanceof Bullet){
                this.teamCombatManager.addEntity(entity);
            }else{
                this.entities.push(entity);
            }
        }
    }

    /*
        Method Name: hasEntity
        Method Parameters:
            entityID:
                The id of an entity
        Method Description: Checks if an entity with the given id exists
        Method Return: boolean, true -> has entity, false -> does not have the entity
    */
    hasEntity(entityID){
        return this.getEntity(entityID) != null;
    }


    /*
        Method Name: getEntity
        Method Parameters:
            entityID:
                The id of an entity
        Method Description: Finds an entity if it exists
        Method Return: Entity
    */
    getEntity(entityID){
        for (let [entity, entityIndex] of this.entities){
            if (entity.getID() == entityID){
                return entity;
            }
        }

        for (let plane of this.getPlanes()){
            if (plane.getID() == entityID){
                return plane;
            }
        }

        for (let bullet of this.getBullets()){
            if (bullet.getID() == entityID){
                return bullet;
            }
        }
        return null;
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
        Method Name: addPlane
        Method Parameters:
            plane:
                A plane object
        Method Description: Adds a plane to the scene
        Method Return: void
    */
    addPlane(plane){
        this.teamCombatManager.addPlane(plane);
    }

    /*
        Method Name: addBullet
        Method Parameters:
            bullet:
                A bullet object
        Method Description: Adds a bullet to the scene
        Method Return: void
    */
    addBullet(bullet){
        this.teamCombatManager.addBullet(bullet);
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiff:
                Time between ticks
        Method Description: Makes things happen within a tick
        Method Return: void
    */
    async tick(timeDiff){
        if (!this.ticksEnabled){ return; }
        for (let [entity, entityIndex] of this.entities){
            await entity.tick(timeDiff);
        }
        await this.teamCombatManager.tick(timeDiff);
    }

    /*
        Method Name: getNumberOfEntities
        Method Parameters: None
        Method Description: Determines the number of entities that exist
        Method Return: int
        Note: May not count freecam and in the future may need modification
    */
    getNumberOfEntities(){
        return this.teamCombatManager.getNumberOfEntities();
    }

    /*
        Method Name: displayHUD
        Method Parameters: None
        Method Description: Displays the HUD on the screen
        Method Return: void
    */
    displayHUD(){
        let x = 0;
        let y = 0;
        let planeSpeed = 0;
        let throttle = 0;
        let health = 0;
        let fps = frameCounter.getFPS();
        let numberOfEntities = this.getNumberOfEntities();
        let allyPlanes = this.teamCombatManager.countAlliance("Allies");
        let axisPlanes = this.teamCombatManager.countAlliance("Axis");
        let entityID = 0;
        if (this.hasEntityFocused()){
            let focusedEntity = this.getFocusedEntity();
            x = focusedEntity.getX();
            y = focusedEntity.getY();
            planeSpeed = focusedEntity.getSpeed();
            throttle = focusedEntity.getThrottle();
            health = focusedEntity.getHealth();
            entityID = focusedEntity.getDisplayID();
            if (focusedEntity.hasRadar()){
                focusedEntity.getRadar().display();
            }
        }
        textSize(20);
        fill("green");
        textAlign(LEFT);
        text(`x: ${x}`, 10, 20);
        text(`y: ${y}`, 10, 40);
        text(`Speed: ${planeSpeed}`, 10, 60);
        text(`Throttle: ${throttle}`, 10, 80);
        text(`Health: ${health}`, 10, 100);
        text(`FPS: ${fps}`, 10, 120);
        text(`Entities: ${numberOfEntities}`, 10, 140);
        text(`ID: ${entityID}`, 10, 160);
        text(`Allied Planes Remaining: ${allyPlanes}`, 10, 180);
        text(`Axis Planes Remaining: ${axisPlanes}`, 10, 200);
        if (activeGameMode instanceof RemoteDogfight){
            text(`numTicks: ${activeGameMode.getTickManager().getNumTicks()}`, 10, 220);
            text(`version: ${activeGameMode.getVersion()}`, 10, 240);
        }
    }
    
    /*
        Method Name: displayBackground
        Method Parameters:
            lX:
                The lower x bound of the canvas relative to the focused entity (if exists)
            bY:
                The lower y bound of the canvas relative to the focused entity (if exists)
        Method Description: Displays background on the screen
        Method Return: void
    */
    displayBackground(lX, bY){
        let lXP = Math.floor(lX);
        let bYP = Math.floor(bY);
        let groundImage = images[FILE_DATA["background"]["ground"]["picture"]];
        let groundImageHeight = groundImage.height;
        let groundImageWidth = groundImage.width;
        // If displaying ground
        if (bYP < 0){
            let groundImageOffsetY = Math.abs(bYP) % groundImageHeight;
            let groundImageOffsetX = Math.abs(lXP) % groundImageWidth;
            let bottomDisplayGroundY = bYP + groundImageOffsetY * (lXP < 0 ? -1 : 1);
            // Find bottom corner of image to display in window
            while (bottomDisplayGroundY + groundImageHeight > bYP){
                bottomDisplayGroundY -= groundImageHeight;
            }
            // Add once more to get back to top left corner
            bottomDisplayGroundY += groundImageHeight;
            let bottomDisplayGroundX = lXP - groundImageOffsetX;
            // Find bottom corner of image to display in window
            while (bottomDisplayGroundX + groundImageWidth > lXP){
                bottomDisplayGroundX -= groundImageWidth;
            }
            // Add once more to get back to top left corner
            bottomDisplayGroundX += groundImageWidth;

            // Display ground images
            for (let y = bottomDisplayGroundY; y <= 0; y += groundImageHeight){
                for (let x = bottomDisplayGroundX; x < this.width + bottomDisplayGroundX + groundImageWidth; x += groundImageWidth){
                    let displayX = x-lXP;
                    drawingContext.drawImage(groundImage, displayX, this.getDisplayY(0, 0, bYP));
                }
            }
        }
        // Display above ground
        let aboveGroundImage = images[FILE_DATA["background"]["above_ground"]["picture"]];
        let aboveGroundHeight = aboveGroundImage.height;
        let aboveGroundWidth = aboveGroundImage.width;
        // If screen contains the above ground range
        if (bYP < aboveGroundHeight && bYP > -1 * aboveGroundHeight){
            let aboveGroundImageOffsetX = Math.abs(lXP) % aboveGroundWidth;
            // Display the above ground image
            let bottomDisplayAboveGroundX = lXP - aboveGroundImageOffsetX * (lXP < 0 ? -1 : 1);
            // Find bottom corner of image to display in window
            while (bottomDisplayAboveGroundX + aboveGroundWidth > lXP){
                bottomDisplayAboveGroundX -= aboveGroundWidth;
            }
            bottomDisplayAboveGroundX += aboveGroundWidth;
            // Display along the screen
            for (let x = bottomDisplayAboveGroundX; x < this.width + aboveGroundWidth + bottomDisplayAboveGroundX; x += aboveGroundWidth){
                let displayX = x-lXP;
                drawingContext.drawImage(aboveGroundImage, displayX, this.getDisplayY(aboveGroundHeight, 0, bYP));
            }
        }

        // Display sky
        if (bYP + this.height > aboveGroundHeight){
            let skyImage = images[FILE_DATA["background"]["sky"]["picture"]];
            let skyHeight = skyImage.height;
            let skyWidth = skyImage.width;
            let skyImageOffsetY = (bYP-aboveGroundHeight) % skyHeight;
            let skyImageOffsetX = Math.abs(lXP) % skyWidth;

            let bottomDisplaySkyX = lXP - skyImageOffsetX * (lXP < 0 ? -1 : 1);
            // Find bottom corner of image to display in window
            while (bottomDisplaySkyX + skyWidth > lXP){
                bottomDisplaySkyX -= skyWidth;
            }
            // Add once more to get back to top left corner
            bottomDisplaySkyX += skyWidth;

            //let bottomDisplaySkyY = bYP + skyImageOffsetY + skyHeight;
            let bottomDisplaySkyY = bYP - skyImageOffsetY;
            // Find bottom corner of image to display in window
            // TODO: Find out why this bandaid works I was just tired and typing random stuff
            while (bottomDisplaySkyY < bYP + skyHeight - skyImageOffsetY){
                bottomDisplaySkyY += skyHeight;
            }
            // Add once more to get back to top left corner
            // Display ground images
            for (let y = bottomDisplaySkyY; y < bottomDisplaySkyY + this.height + skyHeight; y += skyHeight){
                for (let x = bottomDisplaySkyX; x < bottomDisplaySkyX + this.width + skyWidth; x += skyWidth){
                    //let displayY = y-bYP;
                    let displayX = x-lXP;
                    drawingContext.drawImage(skyImage, displayX, this.getDisplayY(y, 0, bYP));
                }
            }
            //console.log(iC, bYP, skyImageOffsetY, bottomDisplaySkyY, skyHeight + aboveGroundHeight)
        }

    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the whole scene on the screen
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
            //debugger
            lX = focusedEntity.getCenterX() - (this.width) / 2;
            bY = focusedEntity.getCenterY() - (this.height) / 2;
        }
        this.displayBackground(lX, bY);
        this.teamCombatManager.displayAll(this, lX, bY, focusedEntity != null ? focusedEntity.getID() : -1);
        if (this.hasEntityFocused()){
            this.displayEntity(focusedEntity, lX, bY);
        }
        this.displayHUD();
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
        let rX = lX + this.width - 1;
        let tY = bY + this.height - 1;
        // Is on screen
        if (!entity.touchesRegion(lX, rX, bY, tY)){ return; }
        let displayX = this.getDisplayX(entity.getCenterX(), entity.getWidth(), lX);
        let displayY = this.getDisplayY(entity.getCenterY(), entity.getHeight(), bY);
        if (entity.isDead()){
            drawingContext.drawImage(images["explosion"], displayX, displayY); 
            return; 
        }

        if (entity instanceof FighterPlane){
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

            if (entity.isSmoking()){
                translate(rotateX, rotateY);
                rotate(-1 * toRadians(entity.getAngle()));
                if (!entity.isFacingRight()){
                    scale(-1, 1);
                }
                drawingContext.drawImage(entity.getSmokeImage(), 0 - entity.getWidth() / 2, 0 - entity.getHeight() / 2); 
                if (!entity.isFacingRight()){
                    scale(-1, 1);
                }
                rotate(toRadians(entity.getAngle()));
                translate(-1 * rotateX, -1 * rotateY);
            }
        }else{
            drawingContext.drawImage(entity.getImage(), displayX, displayY); 
        }
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
        this.enableCollisions();
    }
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports = PlaneGameScene;
}