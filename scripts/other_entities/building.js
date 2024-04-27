// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    Entity = require("./entity.js");
    RectangleHitbox = require("../general/hitboxes.js").RectangleHitbox;
}
/*
    Class Name: Building
    Description: A simple grey building that exists to be displayed and destroyed
*/
class Building extends Entity {
    /*
        Method Name: constructor
        Method Parameters: 
            x:
                The x location of the left side of the building
            width:
                The width of the buidling
            height:
                The height of the building
            health:
                The health of the building
            gamemode:
                A Game object
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, width, height, health, gamemode){
        super(gamemode);
        this.x = x;
        this.width = width;
        this.height = height;
        this.hitBox = new RectangleHitbox(width, height, x + width/2, height/2);
        this.health = health;
    }

    /*
        Method Name: getXAtStartOfTick
        Method Parameters: None
        Method Description: Get the center x value at the start of the tick
        Method Return: Number
    */
    getXAtStartOfTick(){
        return this.getCenterX();
    }

    /*
        Method Name: getYAtStartOfTick
        Method Parameters: None
        Method Description: Get the center y value at the start of the tick
        Method Return: Number
    */
    getYAtStartOfTick(){
        return this.getCenterY();
    }

    /*
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: The building does not move so it provides 0 x velocity
        Method Return: integer
    */
    getXVelocity(){
        return 0;
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: The building does not move so it provides 0 y velocity
        Method Return: integer
    */
    getYVelocity(){
        return 0;
    }

    /*
        Method Name: damage
        Method Parameters: 
            amount:
                Amount of damage taken by this buidling
        Method Description: Damages a building
        Method Return: void
    */
    damage(amount){
        this.health -= amount;
        if (this.health <= 0){
            this.die();
        }
    }

    /*
        Method Name: die
        Method Parameters: None
        Method Description: Handles the death of a building
        Method Return: void
    */
    die(){
        this.gamemode.getEventHandler().emit({
            "name": "building_collapse",
            "x": this.x,
            "building_x_size": this.width,
            "building_y_size": this.height
        });
        super.die();
    }

    /*
        Method Name: getCenterX
        Method Parameters: None
        Method Description: Determines the x coordinate of the building center
        Method Return: float
    */
    getCenterX(){
        return this.x + this.width / 2;
    }

    /*
        Method Name: getCenterY
        Method Parameters: None
        Method Description: Determines the y coordinate of the building center
        Method Return: float
    */
    getCenterY(){
        return this.height / 2;
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getWidth(){
        return this.width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Getter
        Method Return: Number
    */
    getHeight(){
        return this.height;
    }

    /*
        Method Name: getHitbox
        Method Parameters: None
        Method Description: Getter
        Method Return: Hitbox
    */
    getHitbox(){
        return this.hitBox;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays the building on the canvas
        Method Return: void
    */
    display(lX, bY){
        // Do not display if dead
        if (this.isDead()){ return; }
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.gamemode.getScene().getDisplayX(this.x, 0, lX);
        let displayY = this.gamemode.getScene().getDisplayY(this.height, 0, bY);
        
        // The display the building
        strokeRectangle(Colour.fromCode(PROGRAM_DATA["building_data"]["building_colour"]), displayX, displayY, this.width * gameZoom, this.height * gameZoom)

    }

    /*
        Method Name: touchesRegion
        Method Parameters: 
            lX:
                Left x of screen in gamemode coordinates
            rX:
                Right x of screen in gamemode coordinates
            bY:
                Bottom y of screen in gamemode coordinates
            tY:
                Top y of screen in gamemode coordinates
        Method Description: Checks if the building is in the specified region or at least touches it
        Method Return: Boolean
    */
    touchesRegion(lX, rX, bY, tY){
        if (this.x + this.getWidth() < lX){ return false; }
        if (this.x > rX){ return false; }
        if (tY < 0){ return false; }
        if (bY > this.getHeight()){ return false; }
        return true;
    }

    /*
        Method Name: toJSON
        Method Parameters: None
        Method Description: Creates a JSON representation of the building
        Method Return: JSON Object
    */
    toJSON(){
        return {
            "x": this.x,
            "width": this.width,
            "height": this.height,
            "health": this.health,
            "dead": this.isDead()
        }
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep:
                A json representation of a building
        Method Description: Modifies the building based on a JSON representation
        Method Return: void
    */
    fromJSON(rep){
        this.health = rep["health"];
        this.setDead(rep["dead"]);
    }

    /*
        Method Name: fromJSON
        Method Parameters:
            rep:
                JSON representation of a building
            gamemode:
                The gamemode that the building is a part of
        Method Description: Creates a building from a json representation
        Method Return: Building
    */
    static fromJSON(rep, gamemode){
        let building = new Building(rep["x"], rep["width"], rep["height"], rep["health"], gamemode);
        building.setDead(rep["dead"]);
        return building;
    }
}
// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = Building;
}