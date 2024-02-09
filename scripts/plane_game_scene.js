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
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        super();
        this.collisionsEnabled = true;
        this.teamCombatManager = new TeamCombatManager(FILE_DATA["teams"]);
    }

    /*
        Method Name: getTeamCombatManager
        Method Parameters: None
        Method Description: Getter
        Method Return: TeamCombatManager
    */
    getTeamCombatManager(){
        return this.teamCombatManager;
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

    // TODO: Comments
    getBuildings(){
        let buildings = [];
        for (let [entity, entityIndex] of this.entities){
            if (entity instanceof Building){
                buildings.push(entity);
            }
        }
        return buildings;
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
        Method Parameters:
            timeDiff:
                Time between ticks
        Method Description: Makes things happen within a tick
        Method Return: void
    */
    async tick(timeDiff){
        if (!this.ticksEnabled){ return; }
        // Tick all entities
        for (let [entity, entityIndex] of this.entities){
            await entity.tick(timeDiff);
        }
        await this.teamCombatManager.tick(timeDiff);
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
        return this.teamCombatManager.getNumberOfEntities() + this.entities.getLength();
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
        // TODO: Use Menu make text in the future
        textSize(20);
        fill("green");
        textAlign(LEFT, TOP);
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
        CLOUD_MANAGER.display(lX, bY);
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
                for (let x = bottomDisplayGroundX; x < this.getWidth() + bottomDisplayGroundX + groundImageWidth; x += groundImageWidth){
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
            for (let x = bottomDisplayAboveGroundX; x < this.getWidth() + aboveGroundWidth + bottomDisplayAboveGroundX; x += aboveGroundWidth){
                let displayX = x-lXP;
                drawingContext.drawImage(aboveGroundImage, displayX, this.getDisplayY(aboveGroundHeight, 0, bYP));
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
        let lX = 0; // Bottom left x
        let bY = 0; // Bottom left y
        let focusedEntity = null;

        // Set up position of the displayed frame of the word based on the focused entity 
        if (this.hasEntityFocused()){
            focusedEntity = this.getFocusedEntity();
            //debugger
            lX = focusedEntity.getCenterX() - (this.getWidth()) / 2;
            bY = focusedEntity.getCenterY() - (this.getHeight()) / 2;
        }

        // Play all sounds that are queued for this frame
        SOUND_MANAGER.playAll(lX, lX + getScreenWidth(), bY, bY + getScreenHeight());

        // Display the background
        this.displayBackground(lX, bY);
        
        // Display all planes associated with the team combat manager
        this.teamCombatManager.displayAll(this, lX, bY, focusedEntity != null ? focusedEntity.getID() : -1);

        // Display all extra entities
        for (let [entity, eI] of this.entities){
            entity.display(lX, bY);
        }
        
        // Display the currently focused entity
        if (this.hasEntityFocused()){
            this.focusedEntity.display(lX, bY);
        }

        // Display the HUD
        this.displayHUD();
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