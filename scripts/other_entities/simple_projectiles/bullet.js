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
            angle:
                The angle of the bullet's trajectory
            shooterID:
                The id of the plane that shot the bullet
            shooterClass:
                The type of plane that shot the bullet
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, gamemode, xVelocity, yVelocity, angle, shooterID, shooterClass){
        super(x, y, gamemode, xVelocity, yVelocity, gamemode.getNumTicks(), PROGRAM_DATA["bullet_data"]["radius"]);
        angle = toRadians(angle); // Convert the angle to radians so it can be used in calculations
        this.yVI += + Math.sin(angle) * PROGRAM_DATA["bullet_data"]["speed"];
        this.xVelocity += Math.cos(angle) * PROGRAM_DATA["bullet_data"]["speed"];
        this.shooterClass = shooterClass;
        this.shooterID = shooterID;
    }

    // TODO: Comments
    getDamage(){
        return PROGRAM_DATA["plane_data"][this.shooterClass]["bullet_damage"];
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
    fromJSON(jsonRepresentation, force=false){
        //console.log(this.isDead(), force, jsonRepresentation)
        // Don't overwrite a living bullet
        // TODO: Local still kills bullets even without collision right?
        if (!this.isDead() && !force){ 
            return; 
        }
        // No need to taken info from a dead bullet
        if (jsonRepresentation["dead"]){ return; }
        this.dead = false;
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
}
// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = Bullet;
}