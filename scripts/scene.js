var images = {};

async function loadRotatedImages(name){
    for (let i = 0; i < 360; i++){
        images[name + "_left_" + i.toString()] = await loadLocalImage("images/" + name + "/left/" + i.toString() + ".png");
        images[name + "_right_" + i.toString()] = await loadLocalImage("images/" + name + "/right/" + i.toString() + ".png");
    }
}

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

async function loadPlanes(){
    for (const [planeName, planeDetails] of Object.entries(fileData["plane_data"])) {
        await loadRotatedImages(planeName);
    }
}

async function loadToImages(imageName, type=".png"){
    images[imageName] = await loadLocalImage("images/" + imageName + type);
}

class Scene{
    constructor(width, height){
        this.width = width;
        this.height = height;
        this.nextEntityID = 0;
        this.entities = [];
        this.focusedEntityIndex = -1;
    }

    getEntities(){
        return this.entities;
    }

    display(){
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
        for (let entity of this.entities){
            if (this.hasEntityFocused() && entity.getID() == focusedEntity.getID()){ continue; }
            this.displayEntity(entity, lX, bY);
        }

        if (this.hasEntityFocused()){
            this.displayEntity(focusedEntity, lX, bY);
        }
    }

    setFocusedEntity(entityID){
        return this.focusedEntityIndex = this.getEntityIndex(entityID);
    }

    displayBackground(lX, bY){
        let lXP = Math.floor(lX);
        let bYP = Math.floor(bY);
        let groundImage = images[fileData["background"]["ground"]["picture"]];
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
                for (let x = bottomDisplayGroundX; x < CANVAS_WIDTH + bottomDisplayGroundX + groundImageWidth; x += groundImageWidth){
                    let displayX = x-lXP;
                    drawingContext.drawImage(groundImage, displayX, this.getDisplayY(0, 0, bYP));
                }
            }
        }
        // Display above ground
        let aboveGroundImage = images[fileData["background"]["above_ground"]["picture"]];
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
            for (let x = bottomDisplayAboveGroundX; x < CANVAS_WIDTH + aboveGroundWidth + bottomDisplayAboveGroundX; x += aboveGroundWidth){
                let displayX = x-lXP;
                drawingContext.drawImage(aboveGroundImage, displayX, this.getDisplayY(aboveGroundHeight, 0, bYP));
            }
        }

        // Display sky
        if (bYP + CANVAS_HEIGHT > aboveGroundHeight){
            let skyImage = images[fileData["background"]["sky"]["picture"]];
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
            for (let y = bottomDisplaySkyY; y < bottomDisplaySkyY + CANVAS_HEIGHT + skyHeight; y += skyHeight){
                for (let x = bottomDisplaySkyX; x < bottomDisplaySkyX + CANVAS_WIDTH + skyWidth; x += skyWidth){
                    //let displayY = y-bYP;
                    let displayX = x-lXP;
                    drawingContext.drawImage(skyImage, displayX, this.getDisplayY(y, 0, bYP));
                }
            }
            //console.log(iC, bYP, skyImageOffsetY, bottomDisplaySkyY, skyHeight + aboveGroundHeight)
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
            this.focusedEntityIndex = 0;
            // TODO: Find a better one
            if (this.entities.length == 0){
                this.focusedEntityIndex = -1;
            }
        }
    } 
    
    delete(entityID){
        let newArray = copyArray(this.entities);
        let index = -1;

        // Find element with ID
        for (let i = 0; i < newArray.length; i++){
            if (newArray[i].getID() == entityID){
                index = i;
                break;
            }
        }
        // Not found
        if (index == -1){
            return;
        }

        // No focused entity anmore 
        if (index == this.focusedEntityIndex){
            this.focusedEntityIndex = -1;
        }

        // shift down to deleting 
        for (let i = index; i < newArray.length - 1; i++){
            newArray[i] = newArray[i+1];
        }

        newArray.pop();
        this.entities = newArray;
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

    getEntity(id){
        for (let entity of this.entities){
            if (entity.getID() == id){ return entity; }
        }
        return null;
    }

    hasEntity(id){
        return this.getEntity(id) != null;
    }

    getFocusedEntity(){
        return this.entities[this.focusedEntityIndex];
    }

    getEntityIndex(entityID){
        for (let i = 0; i < this.entities.length; i++){
            if (entityID == this.entities[i].getID()){
                return i;
            }
        }
        return -1;
    }

    tick(timeDiff){
        for (let entity of this.entities){
            entity.tick(timeDiff);
        }

        this.checkCollisions();
    }

    checkCollisions(){
        let bullets = [];
        let destructableEntities = [];

        for (let entity of this.entities){
            if (entity instanceof Bullet){
                bullets.push(entity);
            }else if (entity instanceof FighterPlane){
                destructableEntities.push(entity);
            }
        }

        for (let bullet of bullets){
            for (let destructableEntity of destructableEntities){
                if (onSameTeam(destructableEntity.getPlaneClass(), bullet.getShooterClass())){ continue; }
                if (destructableEntity.collidesWith(bullet.getHitbox())){
                    destructableEntity.damage(1);
                    bullet.delete();
                    //document.getElementById("hitSound").play();
                    break;
                }
            }
        }
    }
}