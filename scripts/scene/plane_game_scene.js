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
    IMAGES[imageName] = await loadLocalImage("images/" + imageName + type);
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
    IMAGES[name] = await loadLocalImage("images/" + name + "/" + name + ".png");
}

/*
    Method Name: loadPlanes
    Method Parameters: None
    Method Description: Loads all the images of all planes.
    Method Return: void
    Note: This is a relic from when planes has 720 images and took a long time to load. It should be redone.
*/
async function loadPlanes(){
    for (const [planeName, planeDetails] of Object.entries(PROGRAM_DATA["plane_data"])) {
        await loadRotatedImages(planeName);
    }
}
/*
    Class Name: PlaneGameScene
    Description: A scene to be used specifically for the WW2 Plane Game.
*/
class PlaneGameScene {
    /*
        Method Name: constructor
        Method Parameters:
            gamemode:
                The gamemode using the scene
            visualEffectManager:
                A maanger of visual effects
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(gamemode=null, visualEffectManager=null){
        this.gamemode = gamemode;
        this.skyManager = new SkyManager(this);
        this.visualEffectManager = visualEffectManager;
        this.entities = new NotSamLinkedList();
        this.focusedEntity = null;
        this.ticksEnabled = true;
        this.displayEnabled = true;
    }

    /*
        Method Name: hasVisualEffectManager
        Method Parameters: None
        Method Description: Checks whether this has a visual effect manager
        Method Return: Boolean
    */
    hasVisualEffectManager(){
        return this.visualEffectManager != null;
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
        Method Name: getDisplayX
        Method Parameters:
            centerX:
                The x coordinate of the center of the entity
            width:
                The width of the entity
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            round:
                If rounded down to nearest pixel
        Method Description: Determines the top left corner where an image should be displayed
        Method Return: int
    */
    getDisplayX(centerX, width, lX, round=false){
        // Find relative to bottom left corner
        let displayX = (centerX - lX) * gameZoom;

        // Change coordinate system
        displayX = this.changeToScreenX(displayX);

        // Find top left corner
        displayX = displayX - width / 2;

        // Round down to nearest pixel
        if (round){
            displayX = Math.floor(displayX);
        }
        return displayX;
    }

    /*
        Method Name: getDisplayY
        Method Parameters:
            centerY:
                The y coordinate of the center of the entity
            height:
                The height of the entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
            round:
                If rounded down to nearest pixel
        Method Description: Determines the top left corner where an image should be displayed
        Method Return: int
    */
    getDisplayY(centerY, height, bY, round=false){
        // Find relative to bottom left corner
        let displayY = (centerY - bY) * gameZoom;

        // Change coordinate system
        displayY = this.changeToScreenY(displayY);

        // Find top left corner
        displayY = displayY - height / 2;

        // Round down to nearest pixel
        if (round){
            displayY = Math.floor(displayY);
        }
        return displayY;
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
            return; 
        }
        this.entities.remove(foundIndex);
    }

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
        return getScreenHeight() - y;
    }

    /*
        Method Name: changeFromScreenY
        Method Parameters: 
            y:
                An y coordinate in the game coordinate system
        Method Description: Transforms an screen y to a game y
        Method Return: float
    */
    changeFromScreenY(y){
        return this.changeToScreenY(y);
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
        Method Name: getWidth
        Method Parameters: None
        Method Description: Determine width of the screen
        Method Return: Integer
    */
    getWidth(){
        return getZoomedScreenWidth();
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Determine Height of the screen
        Method Return: Integer
    */
    getHeight(){
        return getZoomedScreenHeight();
    }

    getSoundManager(){
        return this.gamemode.getSoundManager();
    }

    /*
        Method Name: getSkyManager
        Method Parameters: None
        Method Description: Getter
        Method Return: SkyManager
    */
    getSkyManager(){
        return this.skyManager;
    }

    /*
        Method Name: getGamemode
        Method Parameters: None
        Method Description: Getter
        Method Return: Gamemode
    */
    getGamemode(){
        return this.gamemode;
    }

    /*
        Method Name: areBulletPhysicsEnabled
        Method Parameters: None
        Method Description: Checks if bullet physics are enabled
        Method Return: void
    */
    areBulletPhysicsEnabled(){
        return this.gamemode.areBulletPhysicsEnabled();
    }

    /*
        Method Name: getTeamCombatManager
        Method Parameters: None
        Method Description: Getter
        Method Return: TeamCombatManager
    */
    getTeamCombatManager(){
        return this.gamemode.getTeamCombatManager();
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
        for (let plane of this.gamemode.getTeamCombatManager().getLivingPlanes()){
            followableEntities.push(plane);
        }
        return followableEntities;
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
        this.entities.clear();
        for (let entity of entities){
            // TODO: This is somewhat ugly
            if (entity instanceof Plane || entity instanceof Bullet || entity instanceof Bomb || entity instanceof Building){
                continue;
            }else{
                this.addEntity(entity);
            }
        }
    }

    /*
        Method Name: addEntity
        Method Parameters: 
            entity:
                An entity to be added
        Method Description: Adds an entity to the scene
        Method Return: void
    */
    addEntity(entity){
        this.entities.push(entity);
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

        for (let plane of this.getTeamCombatManager().getAllPlanes()){
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
        this.gamemode.getTeamCombatManager().addPlane(plane);
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
        this.gamemode.getTeamCombatManager().addBullet(bullet);
    }

    /*
        Method Name: addBomb
        Method Parameters:
            bomb:
                A bomb dropped from a plane
        Method Description: Adds a bomb to the scene
        Method Return: void
    */
    addBomb(bomb){
        this.addEntity(bomb);
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Makes things happen within a tick
        Method Return: void
    */
    async tick(){
        if (!this.ticksEnabled){ return; }
        // Tick all entities

        for (let [entity, entityIndex] of this.entities){
            await entity.tick();
        }
        // Delete all dead buildings and bombs and other entities?
        this.entities.deleteWithCondition((entity) => { return entity.isDead(); });
    }

    /*
        Method Name: getNumberOfEntities
        Method Parameters: None
        Method Description: Determines the number of entities that exist
        Method Return: int
        Note: May not count freecam and in the future may need modification
    */
    getNumberOfEntities(){
        return this.gamemode.getTeamCombatManager().getNumberOfEntities() + this.entities.getLength();
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
        let fps = FRAME_COUNTER.getFPS();
        let numberOfEntities = this.getNumberOfEntities();
        let allyPlanes = this.gamemode.getTeamCombatManager().countAlliance("Allies");
        let axisPlanes = this.gamemode.getTeamCombatManager().countAlliance("Axis");
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
            HEADS_UP_DISPLAY.updateElement("x", x.toFixed(1));
            HEADS_UP_DISPLAY.updateElement("y", y.toFixed(1));
            HEADS_UP_DISPLAY.updateElement("Speed", planeSpeed.toFixed(1));
            HEADS_UP_DISPLAY.updateElement("Throttle", throttle.toFixed(1));
            HEADS_UP_DISPLAY.updateElement("Health", health.toFixed(1));
            HEADS_UP_DISPLAY.updateElement("FPS", fps);
            HEADS_UP_DISPLAY.updateElement("Game Zoom", gameZoom.toString() + "x");
            HEADS_UP_DISPLAY.updateElement("ID", entityID);
        }
        HEADS_UP_DISPLAY.updateElement("Entities", numberOfEntities);
        HEADS_UP_DISPLAY.updateElement("Allied Planes", allyPlanes);
        HEADS_UP_DISPLAY.updateElement("Axis Planes", axisPlanes);
        HEADS_UP_DISPLAY.display();
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
        this.skyManager.displaySky();
        let lXP = Math.floor(lX);
        let bYP = Math.floor(bY);
        let groundImage = IMAGES[PROGRAM_DATA["background"]["ground"]["picture"]];
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
                for (let x = bottomDisplayGroundX; x < getScreenWidth() + bottomDisplayGroundX + groundImageWidth; x += groundImageWidth){
                    let displayX = x-lXP;
                    displayImage(groundImage, displayX, this.getDisplayY(0, 0, bYP));
                }
            }
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
        let displayTime = Date.now();
        let lX = 0; // Bottom left x
        let bY = 0; // Bottom left y
        let focusedEntity = null;

        // Set up position of the displayed frame of the word based on the focused entity 
        if (this.hasEntityFocused()){
            focusedEntity = this.getFocusedEntity();
            // TODO: Switch to display x for all entities
            focusedEntity.calculateInterpolatedCoordinates(displayTime);
            lX = focusedEntity.getInterpolatedX() - (this.getWidth()) / 2;
            bY = focusedEntity.getInterpolatedY() - (this.getHeight()) / 2;
        }

        // Play all sounds that are queued for this frame
        this.getSoundManager().playAll(lX, lX + getZoomedScreenWidth()-1, bY, bY + getZoomedScreenHeight()-1);

        // Display the background
        this.displayBackground(lX, bY);
        
        // Display all planes associated with the team combat manager
        this.gamemode.getTeamCombatManager().displayAll(lX, bY, focusedEntity != null ? focusedEntity.getID() : -1, displayTime);

        // Display all extra entities
        for (let [entity, eI] of this.entities){
            entity.display(lX, bY, displayTime);
        }
        
        // Display the currently focused entity
        if (this.hasEntityFocused()){
            this.focusedEntity.display(lX, bY, displayTime);
        }

        // Display Clouds over entities
        this.skyManager.displayClouds(lX, bY);

        // Display visual effects
        if (this.hasVisualEffectManager()){
            this.visualEffectManager.display(this, lX, bY);
        }

        // Display the HUD
        this.displayHUD();
        
        // Display the focused entities own hud
        if (this.hasEntityFocused()){
            this.focusedEntity.displayHUD(displayTime);
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
        Method Name: hasTicksEnabled
        Method Parameters: None
        Method Description: Getter
        Method Return: Boolean
    */
    hasTicksEnabled(){
        return this.ticksEnabled;
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
}