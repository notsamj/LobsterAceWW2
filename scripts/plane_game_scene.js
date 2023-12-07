async function loadRotatedImages(name){
    console.log("Loading", name)
    for (let i = 0; i < 360; i++){
        images[name + "_left_" + i.toString()] = await loadLocalImage("images/" + name + "/128/left/" + i.toString() + ".png");
        images[name + "_right_" + i.toString()] = await loadLocalImage("images/" + name + "/128/right/" + i.toString() + ".png");
    }
}

async function loadPlanes(){
    for (const [planeName, planeDetails] of Object.entries(fileData["plane_data"])) {
        await loadRotatedImages(planeName);
    }
}

class PlaneGameScene extends Scene{
    constructor(width, height){
        super(width, height);
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
                for (let x = bottomDisplayGroundX; x < fileData["constants"]["CANVAS_WIDTH"] + bottomDisplayGroundX + groundImageWidth; x += groundImageWidth){
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
            for (let x = bottomDisplayAboveGroundX; x < fileData["constants"]["CANVAS_WIDTH"] + aboveGroundWidth + bottomDisplayAboveGroundX; x += aboveGroundWidth){
                let displayX = x-lXP;
                drawingContext.drawImage(aboveGroundImage, displayX, this.getDisplayY(aboveGroundHeight, 0, bYP));
            }
        }

        // Display sky
        if (bYP + fileData["constants"]["CANVAS_HEIGHT"] > aboveGroundHeight){
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
            for (let y = bottomDisplaySkyY; y < bottomDisplaySkyY + fileData["constants"]["CANVAS_HEIGHT"] + skyHeight; y += skyHeight){
                for (let x = bottomDisplaySkyX; x < bottomDisplaySkyX + fileData["constants"]["CANVAS_WIDTH"] + skyWidth; x += skyWidth){
                    //let displayY = y-bYP;
                    let displayX = x-lXP;
                    drawingContext.drawImage(skyImage, displayX, this.getDisplayY(y, 0, bYP));
                }
            }
            //console.log(iC, bYP, skyImageOffsetY, bottomDisplaySkyY, skyHeight + aboveGroundHeight)
        }

    }

    checkCollisions(timeDiff){
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
                if (bullet.collidesWith(destructableEntity, timeDiff)){
                    //console.log("hit")
                    destructableEntity.damage(1);
                    bullet.delete();
                    //document.getElementById("hitSound").play();
                    break;
                }
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

        // shift down to deleting 
        for (let i = index; i < newArray.length - 1; i++){
            newArray[i] = newArray[i+1];
        }

        newArray.pop();
        // No focused entity anmore 
        if (entityID == this.focusedEntityID){
            for (let i = 0; i < newArray.length; i++){
                if (newArray[i] instanceof Plane){
                    this.setFocusedEntity(newArray[i].getID());
                    return;
                }
            }
            this.setFocusedEntity(-1);
        }
        this.entities = newArray;
    }
}