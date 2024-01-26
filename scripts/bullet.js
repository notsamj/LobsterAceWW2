// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("../scripts/entity.js");
}
/*
    Class Name: Bullet
    Description: Bullet shot from a plane
*/
class Bullet extends Entity {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The starting x position of the bullet
            y:
                The starting y position of the bullet
            scene:
                A Scene object related to the fighter plane
            xVelocity:
                The starting x velocity of the bullet
            yVelocity:
                The starting y velocity of the bullet
            angle:
                The angle of the bullet's trajectory
            shooterID:
                The id of the plane that shot the bullet
            shooterClass:
                The type of plane that shot the bullet
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, scene, xVelocity, yVelocity, angle, shooterID, shooterClass){
        super(scene);
        this.x = x;
        this.y = y;
        angle = toRadians(angle); // Convert the angle to radians so it can be used in calculations
        this.yVelocity = yVelocity + Math.sin(angle) * FILE_DATA["bullet_data"]["speed"];
        this.xVelocity = xVelocity + Math.cos(angle) * FILE_DATA["bullet_data"]["speed"];
        this.hitBox = new CircleHitbox(FILE_DATA["bullet_data"]["radius"]);
        this.shooterClass = shooterClass;
        this.shooterID = shooterID;
    }

    /*
        Method Name: tick
        Method Parameters:
            timePassed:
                The time between ticks (in MS)
        Method Description: Determine movement and death each tick
        Method Return: void
    */
    tick(timePassed){
        let timeProportion = timePassed / 1000; // Proportion of a second
        let yAcceleration = FILE_DATA["constants"]["GRAVITY"] * timeProportion;

        // Apply acceleration
        this.yVelocity = this.yVelocity - yAcceleration;
        
        this.x += this.xVelocity * timeProportion;
        this.y += this.yVelocity * timeProportion;

        // If below ground or too fast or too far away from planes to matter
        if (this.expectedToDie()){
            this.die();
            return;
        }
    }

    /*
        Method Name: getAlliance
        Method Parameters: None
        Method Description: Determine movement and death each tick
        Method Return: String, alliance name
    */
    getAlliance(){
        return planeModelToAlliance(this.shooterClass);
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Provide the width of the bullet image
        Method Return: Integer
    */
    getWidth(){
        return this.getImage().width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Provide the height of the bullet image
        Method Return: Integer
    */
    getHeight(){
        return this.getImage().height;
    }

    /*
        Method Name: getImage
        Method Parameters: None
        Method Description: Provide the bullet image
        Method Return: Image
    */
    getImage(){
        return images["bullet"];
    }

    /*
        Method Name: getHitbox
        Method Parameters: None
        Method Description: Provide the hitbox (updated with the current bullet position)
        Method Return: Hitbox
    */
    getHitbox(){
        this.hitBox.update(this.x, this.y);
        return this.hitBox;
    }

    /*
        Method Name: getShooterID
        Method Parameters: None
        Method Description: Provide the ID of the bullet's shooter
        Method Return: String
    */
    getShooterID(){
        return this.shooterID;
    }

    /*
        Method Name: getShooterClass
        Method Parameters: None
        Method Description: Provide the type of plane that shot the bullet
        Method Return: Provide
    */
    getShooterClass(){
        return this.shooterClass;
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Provide the current x velocity of the bullet
        Method Return: float
    */
    getXVelocity(){
        return this.xVelocity;
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Provide the current y velocity of the bullet
        Method Return: float
    */
    getYVelocity(){
        return this.yVelocity;
    }

    /*
        Method Name: expectedToDie
        Method Parameters: None
        Method Description: Determine if the bullet is too far away from the other planes that its effectively dead
        Method Return: boolean, true if expected to die, false otherwise
    */
    expectedToDie(){
        let belowGround = this.y < 0;
        let movingTooFast = Math.abs(this.yVelocity) > FILE_DATA["constants"]["EXPECTED_CANVAS_HEIGHT"] * FILE_DATA["constants"]["MAX_BULLET_Y_VELOCITY_MULTIPLIER"];
        let maxX = null;
        let maxY = null;
        let minX = null;
        let minY = null;
        // Look through all the planes to determine the minX, maX of any plane
        for (let fighterPlane of this.scene.getPlanes()){
            let x = fighterPlane.getX();
            let y = fighterPlane.getY();
            if (maxX == null){
                maxX = x;
                minX = x;
                minY = y;
                maxY = y;
                continue;
            }
            maxX = Math.max(maxX, x);
            minX = Math.min(minX, x);
            maxY = Math.max(maxY, y);
            minY = Math.min(minY, y);
        }
        let tooFarToTheLeftOrRight = maxX != null && (this.x + FILE_DATA["constants"]["EXPECTED_CANVAS_WIDTH"] < minX || this.x - FILE_DATA["constants"]["EXPECTED_CANVAS_WIDTH"] > maxX);
        let tooFarToUpOrDown = maxY != null && (this.y + FILE_DATA["constants"]["EXPECTED_CANVAS_HEIGHT"] < minY || this.y - FILE_DATA["constants"]["EXPECTED_CANVAS_HEIGHT"] > maxY);
        
        return belowGround || movingTooFast || tooFarToTheLeftOrRight || tooFarToUpOrDown;
    }

    /*
        Method Name: collidesWith
        Method Parameters:
            otherEntity:
                An entity that the bullet might collide with
            timeDiff:
                The time passed between two ticks
        Method Description: Checks if the bullet collides with another entity
        Method Return: boolean, true if collides, false otherwise
    */
    collidesWith(otherEntity, timeDiff){
        let timeProportion = timeDiff / 1000;

        let bHitbox = this.getHitbox();
        let bXV = this.getXVelocity();
        let bYV = this.getYVelocity();
        let bEndX = this.x;
        let bEndY = this.y;
        let bStartX = bEndX - bXV * timeProportion;
        let bStartY = bEndY - bYV * timeProportion;
        let bX = bStartX;
        let bY = bStartY;

        let oHitbox = otherEntity.getHitbox();
        let oXV = otherEntity.getXVelocity();
        let oYV = otherEntity.getYVelocity();
        let oEndX = otherEntity.getX();
        let oEndY = otherEntity.getY();
        let oStartX = oEndX - oXV * timeProportion;
        let oStartY = oEndY - oYV * timeProportion;
        let oX = oStartX;
        let oY = oStartY;

        // Before doing the costly interpolation, try to simplify
        let bMinX = Math.min(bStartX, bEndX) - bHitbox.getRadiusEquivalentX();
        let bMaxX = Math.max(bStartX, bEndX) + bHitbox.getRadiusEquivalentX();
        let bMinY = Math.min(bStartY, bEndY) - bHitbox.getRadiusEquivalentY();
        let bMaxY = Math.max(bStartY, bEndY) + bHitbox.getRadiusEquivalentY();

        let oMinX = Math.min(oStartX, oEndX) - oHitbox.getRadiusEquivalentX();
        let oMaxX = Math.max(oStartX, oEndX) + oHitbox.getRadiusEquivalentX();
        let oMinY = Math.min(oStartY, oEndY) - oHitbox.getRadiusEquivalentY();
        let oMaxY = Math.max(oStartY, oEndY) + oHitbox.getRadiusEquivalentY();

        // Check if these objects are far enough apart that its not worth performing further computations
        if (bMinX > oMaxX){ return false; }
        if (bMinY > oMaxY){ return false; }
        if (bMaxX < oMinX){ return false; }
        if (bMaxY < oMinY){ return false; }

        // Loop from start position to end position
        while (lessThanEQDir(bX, bEndX, bXV) && lessThanEQDir(bY, bEndY, bYV) && lessThanEQDir(oX, oEndX, oXV) && lessThanEQDir(oY, oEndY, oYV)){
            // Determine time or next pixel for either object
            let bXTime = (Math.abs(bXV) >= FILE_DATA["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(bX, bXV) - bX))/(Math.abs(bXV))) : Number.MAX_SAFE_INTEGER;
            let bYTime = (Math.abs(bYV) >= FILE_DATA["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(bY, bYV) - bY))/(Math.abs(bYV))) : Number.MAX_SAFE_INTEGER;
            let oXTime = (Math.abs(oXV) >= FILE_DATA["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(oX, oXV) - oX))/(Math.abs(oXV))) : Number.MAX_SAFE_INTEGER;
            let oYTime = (Math.abs(oYV) >= FILE_DATA["constants"]["MIN_VELOCITY_ASSUMPTION"]) ? ((Math.abs(nextIntInDir(oY, oYV) - oY))/(Math.abs(oYV))) : Number.MAX_SAFE_INTEGER;
            // Depending on which pixel is going to next
            let minTime = Math.min(bXTime, bYTime, oXTime, oYTime);
            // Update positions based on time
            bX += minTime * bXV;
            bY += minTime * bYV;
            oX += minTime * oXV;
            oY += minTime * oYV;

            // Update hitbox positions
            bHitbox.update(bX, bY);
            oHitbox.update(oX, oY);
            // If when @ x,y 
            if (bHitbox.collidesWith(oHitbox)){
                return true;
            }
        }
        return false;
    }
}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = Bullet;
}