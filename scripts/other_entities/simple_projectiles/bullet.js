// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    SimpleProjectile = require("./simple_projectile.js");
}
/*
    Class Name: Bullet
    Description: Bullet shot from a plane
*/
class Bullet extends SimpleProjectile {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The starting x position of the bullet
            y:
                The starting y position of the bullet
            gamemode:
                A Gamemode object related to the bullet
            xVelocity:
                The starting x velocity of the bullet
            yVelocity:
                The starting y velocity of the bullet
            angleRAD:
                The angleRAD of the bullet's trajectory (Radians)
            shooterID:
                The id of the plane that shot the bullet
            shooterClass:
                The type of plane that shot the bullet
            bulletDamage:
                The damage of the bullet
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, gamemode, xVelocity, yVelocity, angleRAD, shooterID, shooterClass, bulletDamage){
        super(x, y, gamemode, xVelocity, yVelocity, gamemode.getNumTicks(), PROGRAM_DATA["bullet_data"]["radius"]);
        this.yVI += Math.sin(angleRAD) * PROGRAM_DATA["bullet_data"]["speed"];
        this.xVelocity += Math.cos(angleRAD) * PROGRAM_DATA["bullet_data"]["speed"];
        this.shooterClass = shooterClass;
        this.shooterID = shooterID;
        this.damage = bulletDamage;
    }

    /*
        Method Name: getDamage
        Method Parameters: None
        Method Description: Determines the damage of the bullet
        Method Return: Number
    */
    getDamage(){
        return this.damage;
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
        Method Name: getImage
        Method Parameters: None
        Method Description: Provide the bullet image
        Method Return: Image
    */
    getImage(){
        return getImage("bullet");
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
        Method Name: expectedToDie
        Method Parameters: None
        Method Description: Determine if the bullet is too far away from the other planes that its effectively dead
        Method Return: boolean, true if expected to die, false otherwise
    */
    expectedToDie(){
        let belowGround = this.getY() < 0;
        let yVelocity = this.getYVelocity();
        let movingDownTooFast = yVelocity < 0 && Math.abs(yVelocity) > PROGRAM_DATA["settings"]["expected_canvas_height"] * PROGRAM_DATA["settings"]["max_bullet_y_velocity_multiplier"] * PROGRAM_DATA["bullet_data"]["speed"];
        if (movingDownTooFast || belowGround){ return true; }
        return false;
    }

    /*
        Method Name: collidesWith
        Method Parameters:
            otherEntity:
                An entity that the bullet might collide with
        Method Description: Checks if the bullet collides with another entity
        Method Return: boolean, true if collides, false otherwise
    */
    collidesWith(otherEntity){
        return Bullet.hitInTime(this.getHitbox(), this.getX(), this.getY(), this.getXVelocity(), this.getYVelocity(), otherEntity.getHitbox(), otherEntity.getX(), otherEntity.getY(), otherEntity.getXVelocity(), otherEntity.getYVelocity(), PROGRAM_DATA["settings"]["ms_between_ticks"]/1000);
    }

    /*
        Method Name: collidesWithPlane
        Method Parameters:
            plane:
                A plane to check for a collision with
            simpleBulletData:
                Some simple information about this bullet
            simplePlaneData:
                Some simple information about the plane
        Method Description: Checks for a collision between this bullet and a plane
        Method Return: Boolean, true -> collides, false -> does not collide
    */
    collidesWithPlane(plane, simpleBulletData, simplePlaneData){
        let h1 = this.getHitbox();
        let h2 = plane.getHitbox();

        // Quick checks

        // If plane right < bullet left
        if (simplePlaneData["rX"] + h2.getRadiusEquivalentX() < simpleBulletData["lX"] - h1.getRadiusEquivalentX()){
            return false;
        }

        // If plane left > bullet right
        if (simplePlaneData["lX"] - h2.getRadiusEquivalentX() > simpleBulletData["rX"] + h1.getRadiusEquivalentX()){
            return false;
        }

        // If plane top < bullet bottom
        if (simplePlaneData["tY"] + h2.getRadiusEquivalentX() < simpleBulletData["bY"] - h1.getRadiusEquivalentX()){
            return false;
        }

         // If plane bottom > bullet top
        if (simplePlaneData["bY"] - h2.getRadiusEquivalentX() > simpleBulletData["tY"] + h1.getRadiusEquivalentX()){
            return false;
        }

        // Need further checking
        return SimpleProjectile.checkForProjectileLinearCollision(this, plane, this.gamemode.getNumTicks()-1);
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the bullet
        Method Return: JSON object
    */
    toJSON(){
        return {
            "start_x": this.startX,
            "start_y": this.startY,
            "dead": this.isDead(),
            "x_velocity": this.xVelocity,
            "initial_y_velocity": this.yVI,
            "spawned_tick": this.spawnedTick,
            "shooter_class": this.shooterClass,
            "shooter_id": this.shooterID,
            "index": this.index
        }
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            jsonRepresentation:
                Information about a bullet
        Method Description: Sets the attributes of a bullet from a json representation
        Method Return: void
    */
    fromJSON(jsonRepresentation){
        this.dead = jsonRepresentation["dead"];
        this.startX = jsonRepresentation["start_x"];
        this.startY = jsonRepresentation["start_y"];
        this.spawnedTick = jsonRepresentation["spawned_tick"];
        this.yVI = jsonRepresentation["initial_y_velocity"];
        this.xVelocity = jsonRepresentation["x_velocity"];
        this.shooterClass = jsonRepresentation["shooter_class"];
        this.shooterID = jsonRepresentation["shooter_id"];
        this.index = jsonRepresentation["index"];
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            bulletJSONObject:
                Information about a bullet
            game:
                The Game that the bullet is a part of
        Method Description: Creates a bullet from a representation
        Method Return: JSON Object
    */
    static fromJSON(bulletJSONObject, game){
        let x = bulletJSONObject["start_x"];
        let y = bulletJSONObject["start_y"];
        let bullet = new Bullet(x, y, game, 0, 0, 0, bulletJSONObject["shooter_id"], bulletJSONObject["shooter_class"]);
        bullet.setDead(bulletJSONObject["dead"]);
        bullet.fromJSON(bulletJSONObject, true);
        return bullet;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
            displayTime:
                Time at which frame is displayed
        Method Description: Displays a bullet on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        if (this.isDead()){ return; }
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;
        this.calculateInterpolatedCoordinates(displayTime);
        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }
        // Determine the location it will be displayed at
        let displayX = this.gamemode.getScene().getDisplayX(this.getInterpolatedX(), this.getWidth()*gameZoom, lX);
        let displayY = this.gamemode.getScene().getDisplayY(this.getInterpolatedY(), this.getHeight()*gameZoom, bY);
        let rotateX = displayX + this.getWidth() / 2 * gameZoom;
        let rotateY = displayY + this.getHeight() / 2 * gameZoom;
        let angleRAD = displacementToRadians(this.getXVelocity(), this.getYVelocity());
        // Prepare the display
        translate(rotateX, rotateY);
        rotate(-1 * angleRAD);

        // Game zoom
        scale(gameZoom, gameZoom);

        // Display Bullet Image
        displayImage(this.getImage(), 0 - this.getWidth() / 2, 0 - this.getHeight() / 2);

        // Undo game zoom
        scale(1/gameZoom, 1/gameZoom);
        
        // Reset the rotation and translation
        rotate(angleRAD);
        translate(-1 * rotateX, -1 * rotateY);
    }
}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = Bullet;
}