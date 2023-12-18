if (typeof window === "undefined"){
    Scene = require("../scripts/scene.js");
}
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

class PlaneGameScene extends Scene {
    constructor(width, height){
        super(width, height);
        this.collisionsEnabled = true;
    }

    enableCollisions(){
        this.collisionsEnabled = true;
    }

    disableCollisions(){
        this.collisionsEnabled = false;
    }

    displayHUD(){
        let x = 0;
        let y = 0;
        let planeSpeed = 0;
        let throttle = 0;
        let health = 0;
        let fps = frameCounter.getFPS();
        let numberOfEntities = this.getNumberOfEntities();
        let allyPlanes = countAlliance("Allies");
        let axisPlanes = countAlliance("Axis");
        let entityID = 0;
        if (this.hasEntityFocused()){
            let focusedEntity = this.getFocusedEntity();
            if (focusedEntity instanceof Bullet){
                return;
            }
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
                for (let x = bottomDisplayGroundX; x < this.width + bottomDisplayGroundX + groundImageWidth; x += groundImageWidth){
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
            for (let x = bottomDisplayAboveGroundX; x < this.width + aboveGroundWidth + bottomDisplayAboveGroundX; x += aboveGroundWidth){
                let displayX = x-lXP;
                drawingContext.drawImage(aboveGroundImage, displayX, this.getDisplayY(aboveGroundHeight, 0, bYP));
            }
        }

        // Display sky
        if (bYP + this.height > aboveGroundHeight){
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

    checkCollisions(timeDiff){
        if (!this.collisionsEnabled){ return; }
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
        let i = 0;
        let foundIndex = -1;
        for (let entity of this.entities){
            if (entity.getID() == entityID){
                foundIndex = i;
                break;
            }
            i += 1;
        }
        if (foundIndex == -1){
            console.error("Failed to find entity that should be deleted!");
            debugger;
            return; 
        }
        this.entities.remove(foundIndex);
        // No focused entity anmore 
        if (entityID == this.focusedEntityID){
            for (let entity of this.entities){
                if (entity instanceof Plane){
                    this.setFocusedEntity(entity.getID());
                    return;
                }
            }
            this.setFocusedEntity(-1);
        }
    }

    display(){
        if (!this.displayEnabled){ return; }
        super.display();
        this.displayHUD();
    }

    enable(){
        this.enableTicks();
        this.enableDisplay();
        this.enableCollisions();
    }
}
if (typeof window === "undefined"){
    module.exports = PlaneGameScene;
}