/*
    Class Name: Bomber
    Description: Bomb dropped from a plane
    Note: Requires bullet class to function (because of hitInTime function) (But it's not like they'd even be apart anyway...)
*/
class Bomb extends Entity {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The starting x position of the bomb
            y:
                The starting y position of the bomb
            scene:
                A Scene object related to the fighter plane
            xVelocity:
                The starting x velocity of the bomb
            yVelocity:
                The starting y velocity of the bomb
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, scene, xVelocity, yVelocity){
        super(scene);
        this.x = x;
        this.y = y;
        this.yVelocity = yVelocity + FILE_DATA["bomb_data"]["initial_y_velocity"];
        this.xVelocity = xVelocity;
        this.hitBox = new CircleHitbox(FILE_DATA["bomb_data"]["radius"]);
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

        // If below ground then die
        if (this.isBelowGround()){
            this.die();
            return;
        }
    }

    // TODO: Comments
    die(){
        super.die();
        scene.delete(this.getID());
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
        return images["bomb"];
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
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Provide the current y velocity of the bomb
        Method Return: float
    */
    getYVelocity(){
        return this.yVelocity;
    }

    /*
        Method Name: isBelowGround
        Method Parameters: None
        Method Description: Determine if the bomb is below ground
        Method Return: boolean, true if the bomb is below ground, false otherwise
    */
    isBelowGround(){
        let belowGround = this.y < 0;
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
        let result = hitInTime(this.getHitbox(), this.x, this.y, this.getXVelocity(), this.getYVelocity(), building.getHitbox(), building.getCenterX(), building.getCenterY(), 0, 0, timeDiff/1000);
        return result;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY){
        if (this.isDead()){ return; }
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;

        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Determine the location it will be displayed at
        let displayX = this.scene.getDisplayX(this.getCenterX(), this.getWidth(), lX);
        let displayY = this.scene.getDisplayY(this.getCenterY(), this.getHeight(), bY);
        drawingContext.drawImage(this.getImage(), displayX, displayY); 
    }
}