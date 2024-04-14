// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../../data/data_json.js");
    SimpleProjectile = require("./simple_projectile.js");
}
/*
    Class Name: Bomber
    Description: Bomb dropped from a plane
    TODO: Comments
*/
class Bomb extends SimpleProjectile {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The starting x position of the bomb
            y:
                The starting y position of the bomb
            game:
                The game that the bomb is a part of
            xVelocity:
                The starting x velocity of the bomb
            yVelocity:
                The starting y velocity of the bomb
            currentTick:
                The tick at which the bomb is created
            bomberClass:
                The class of bomber that dropped the bomb
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, game, xVelocity, yVelocity, currentTick, bomberClass){
        super(x, y, game, xVelocity, yVelocity, currentTick, PROGRAM_DATA["bomb_data"]["radius"]);
        this.bomberClass = bomberClass;
        this.yVI += PROGRAM_DATA["bomb_data"]["initial_y_velocity"];
    }

    // TODO: Comments
    getDamage(){
        return PROGRAM_DATA["plane_data"][this.bomberClass]["bomb_damage"];
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
        // If below ground then die
        if (this.isBelowGround()){
            this.explode();
            return;
        }
    }

    /*
        Method Name: explode
        Method Parameters: None
        Method Description: Blocks up on the ground damaging all buildings within the radius
        Method Return: void
    */
    explode(){
        // Loop through and damage all nearby buildings
        for (let [building, bI] of this.gamemode.getTeamCombatManager().getBuildings()){
            if (building.distance(this) < PROGRAM_DATA["bomb_data"]["bomb_explosion_radius"]){
                building.damage(this.getDamage());
            }
        }
        this.die();
    }

    /*
        Method Name: die
        Method Parameters: None
        Method Description: Handles the death of a bomb
        Method Return: void
    */
    die(){
        this.gamemode.getSoundManager().play("explode", this.x, this.y);
        super.die();
    }

    /*
        Method Name: getImage
        Method Parameters: None
        Method Description: Provide the bomb image
        Method Return: Image
    */
    getImage(){
        return getImage("bomb");
    }

    /*
        Method Name: isBelowGround
        Method Parameters: None
        Method Description: Determine if the bomb is below ground
        Method Return: boolean, true if the bomb is below ground, false otherwise
    */
    isBelowGround(){
        let belowGround = this.getY() < 0;
        return belowGround;
    }

    /*
        Method Name: collidesWith
        Method Parameters:
            building:
                An building that the bomb might collide with
        Method Description: Checks if the bomb collides with another entity
        Method Return: boolean, true if collides, false otherwise
    */
    collidesWith(building){
        let result = Bullet.hitInTime(this.getHitbox(), this.getX(), this.getY(), this.getXVelocity(), this.getYVelocity(), building.getHitbox(), building.getCenterX(), building.getCenterY(), 0, 0, PROGRAM_DATA["settings"]["ms_between_ticks"]/1000);
        return result;
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the bomb
        Method Return: A JSON Object
    */
    toJSON(){
        return {
            "start_x": this.startX,
            "start_y": this.startY,
            "x_velocity": this.xVelocity,
            "initial_y_velocity": this.yVI,
            "spawned_tick": this.spawnedTick,
            "dead": this.isDead(),
            "index": this.index,
            "bomber_class": this.bomberClass
        }
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            jsonRepresentation:
                A json representation of a bomb
        Method Description: Set up a bullet based on a json representation
        Method Return: void
    */
    fromJSON(jsonRepresentation, force=false){
        if (!this.isDead() && !force){ 
            return; 
        }
        // No need to taken info from a dead bomb
        if (jsonRepresentation["dead"]){ return; }
        this.startX = jsonRepresentation["start_x"];
        this.startY = jsonRepresentation["start_y"];
        this.spawnedTick = jsonRepresentation["spawned_tick"];
        this.dead = jsonRepresentation["dead"];
        this.yVI = jsonRepresentation["initial_y_velocity"];
        this.xVelocity = jsonRepresentation["x_velocity"];
        this.index = jsonRepresentation["index"];
        this.bomberClass = jsonRepresentation["bomber_class"];
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep: TODO
            game:
                A Game reference that includes the bomb
        Method Description: Creates a Bomb object from a JSON representation
        Method Return: Bomb
    */
    static fromJSON(rep, game){
        let bomb = new Bomb(0, 0, game, 0, 0, 0);
        bomb.fromJSON(rep, true);
        return bomb;
    }
}
// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = Bomb;
}