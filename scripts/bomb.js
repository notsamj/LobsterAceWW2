// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../data/data_json.js");
    Entity = require("./entity.js");
    Bullet = require("./bullet.js");
    CircleHitbox = require("./general/hitboxes.js").CircleHitbox;
}
/*
    Class Name: Bomber
    Description: Bomb dropped from a plane
    Note: Requires bullet class to function (because of hitInTime function) (But it's not like they'd even be apart anyway...)
    TODO: Comments
*/
class Bomb extends Entity {
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
        super(game);
        this.bomberClass = bomberClass;
        this.startX = x;
        this.startY = y;
        this.interpolatedX = 0;
        this.interpolatedY = 0;
        this.spawnedTick = currentTick;
        this.yVI = yVelocity + PROGRAM_DATA["bomb_data"]["initial_y_velocity"];
        this.xVelocity = xVelocity;
        this.hitBox = new CircleHitbox(PROGRAM_DATA["bomb_data"]["radius"]);
        this.index = null;
    }

    // TODO: Comments
    getDamage(){
        return PROGRAM_DATA["plane_data"][this.bomberClass]["bomb_damage"];
    }

    /*
        Method Name: getInterpolatedX
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getInterpolatedX(){
        return this.interpolatedX;
    }

    /*
        Method Name: getInterpolatedY
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getInterpolatedY(){
        return this.interpolatedY;
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Calculate x at the current tick
        Method Return: Number
    */
    getX(){
        return this.getXAtTick(this.gamemode.getNumTicks());
    }

    /*
        Method Name: getXAtTick
        Method Parameters:
            tick:
                Tick to determine the x at
        Method Description: Determine the x position of the bomb at a given tick
        Method Return: Number
    */
    getXAtTick(tick){
        return this.startX + this.xVelocity * ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
    }

    /*
        Method Name: getGameDisplayX
        Method Parameters:
            tick:
                The tick at which to calculate the x position
            currentTime:
                The current time in milliseconds
        Method Description: Calculate the positition of the bomb at the given time and tick
        Method Return: Number
    */
    getGameDisplayX(tick, currentTime){
        return this.getXAtTick(tick) + this.xVelocity * (currentTime - this.gamemode.getLastTickTime()) / 1000;
    }

    /*
        Method Name: getY
        Method Parameters: None
        Method Description: Calculate y at the current tick
        Method Return: Number
    */
    getY(){
        return this.getYAtTick(this.gamemode.getNumTicks());
    }

    /*
        Method Name: getYAtTick
        Method Parameters:
            tick:
                Tick to determine the y at
        Method Description: Determine the y position of the bomb at a given tick
        Method Return: Number
    */
    getYAtTick(tick){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
        return this.startY + this.yVI * seconds - 0.5 * PROGRAM_DATA["constants"]["gravity"] * Math.pow(seconds, 2);
    }

    /*
        Method Name: getGameDisplayX
        Method Parameters:
            tick:
                The tick at which to calculate the y position
            currentTime:
                The current time in milliseconds
        Method Description: Calculate the positition of the bomb at the given time and tick
        Method Return: Number
    */
    getGameDisplayY(tick, currentTime){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"])) + (currentTime - this.gamemode.getLastTickTime()) / 1000;
        return this.startY + this.yVI * seconds - 0.5 * PROGRAM_DATA["constants"]["gravity"] * Math.pow(seconds, 2);
    }

    /*
        Method Name: calculateInterpolatedCoordinates
        Method Parameters:
            currentTime:
                The current time in milliseconds
        Method Description: Calculate the interpolated x and y
        Method Return: void
    */
    calculateInterpolatedCoordinates(currentTime){
        let currentFrameIndex = FRAME_COUNTER.getFrameIndex();
        if (GAMEMODE_MANAGER.getActiveGamemode().isPaused() || !GAMEMODE_MANAGER.getActiveGamemode().isRunning() || this.isDead() || this.lastInterpolatedFrame == currentFrameIndex){
            return;
        }
        this.lastInterpolatedFrame = currentFrameIndex;
        this.interpolatedX = this.getGameDisplayX(this.gamemode.getNumTicks(), currentTime);
        this.interpolatedY = this.getGameDisplayY(this.gamemode.getNumTicks(), currentTime);
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Calculate the y velocity at the current tick
        Method Return: Number
    */
    getYVelocity(){
        let tick = this.gamemode.getNumTicks();
        return this.getYVelocityAtTick(tick);
    }

    /*
        Method Name: getYVelocity
        Method Parameters:
            tick:
                A tick number
        Method Description: Calculate the y velocity at the given tick
        Method Return: Number
    */
    getYVelocityAtTick(tick){
        let seconds = ((tick - this.spawnedTick) / (1000 / PROGRAM_DATA["settings"]["ms_between_ticks"]));
        return this.vYI - PROGRAM_DATA["constants"]["gravity"] * seconds;
    }


    /*
        Method Name: setIndex
        Method Parameters:
            index:
                Index of the bomb in the bomb array
        Method Description: Setter
        Method Return: void
    */
    setIndex(index){
        this.index = index;
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
        Method Name: getWidth
        Method Parameters: None
        Method Description: Provide the width of the bomb image
        Method Return: Integer
    */
    getWidth(){
        return this.getImage().width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Provide the height of the bomb image
        Method Return: Integer
    */
    getHeight(){
        return this.getImage().height;
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
        Method Name: getHitbox
        Method Parameters: None
        Method Description: Provide the hitbox (updated with the current bomb position)
        Method Return: Hitbox
    */
    getHitbox(){
        this.hitBox.update(this.x, this.y);
        return this.hitBox;
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Provide the current x velocity of the bomb
        Method Return: float
    */
    getXVelocity(){
        return this.xVelocity;
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
            timeDiff:
                The time passed between two ticks
        Method Description: Checks if the bomb collides with another entity
        Method Return: boolean, true if collides, false otherwise
    */
    collidesWith(building, timeDiff){
        let result = Bullet.hitInTime(this.getHitbox(), this.x, this.y, this.getXVelocity(), this.getYVelocity(), building.getHitbox(), building.getCenterX(), building.getCenterY(), 0, 0, timeDiff/1000);
        return result;
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
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        if (this.isDead()){ return; }
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;
        this.calculateInterpolatedCoordinates(displayTime);
        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.gamemode.getScene().getDisplayX(this.interpolatedX, this.getWidth(), lX);
        let displayY = this.gamemode.getScene().getDisplayY(this.interpolatedY, this.getHeight(), bY);
        drawingContext.drawImage(this.getImage(), displayX, displayY); 
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
            "start_y": this.startX,
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
    fromJSON(jsonRepresentation){
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
            game:
                A Game reference that includes the bomb
        Method Description: Creates a Bomb object from a JSON representation
        Method Return: Bomb
    */
    static fromJSON(game, rep){
        let bomb = new Bomb(0, 0, game, 0, 0, 0);
        bomb.fromJSON(rep);
        return bomb;
    }
}
// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = Bomb;
}