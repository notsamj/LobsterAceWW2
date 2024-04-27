/*
    Class Name: Entity
    Description: An entity in a game
*/
class Entity {

    /*
        Method Name: constructor
        Method Parameters:
            gamemode:
                A Gamemode object related to the entity
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(gamemode){
        this.id = null;
        this.x = null;
        this.y = null;
        this.gamemode = gamemode;
        this.dead = false;
        this.interpolatedX = 0;
        this.interpolatedY = 0;
        this.lastInterpolatedFrame = -1;
    }

    /*
        Method Name: getGamemode
        Method Parameters: None
        Method Description: Getter
        Method Return: Gamemode
    */
    getGamemode(){
        return this.gamemode;
    }

    /*
        Method Name: calculateInterpolatedCoordinates
        Method Parameters: None
        Method Description: Calculates the x and y coordinates of this object at the current moment
        Method Return: void
    */
    calculateInterpolatedCoordinates(displayTime){
        // TODO: Clean this up
        let currentFrameIndex = FRAME_COUNTER.getFrameIndex();
        if (GAMEMODE_MANAGER.getActiveGamemode().isPaused() || !GAMEMODE_MANAGER.getActiveGamemode().isRunning() || this.isDead() || this.lastInterpolatedFrame == currentFrameIndex){
            return;
        }
        let extraTime = (displayTime - (GAMEMODE_MANAGER.getActiveGamemode().getStartTime() + PROGRAM_DATA["settings"]["ms_between_ticks"] * GAMEMODE_MANAGER.getActiveGamemode().getNumTicks())) % PROGRAM_DATA["settings"]["ms_between_ticks"];
        this.lastInterpolatedFrame = currentFrameIndex;
        this.interpolatedX = this.x + this.xVelocity * extraTime / 1000;
        this.interpolatedY = this.y + this.yVelocity * extraTime / 1000;
    }

    // Abstract
    getInterpolatedX(){}
    getInterpolatedY(){}
    displayHUD(){}

    /*
        Method Name: canRotate
        Method Parameters: None
        Method Description: Provides information about whether or not this entity can rotate
        Method Return: boolean, true -> can rotate, false -> cannot rotate
        Note: Meant to be overridden
    */
    canRotate(){
        return false;
    }

    /*
        Method Name: isDead
        Method Parameters: None
        Method Description: Provides information about whether or not this entity is dead
        Method Return: boolean, true -> entity is dead, false -> entity is NOT dead
    */
    isDead(){
        return this.dead;
    }

    /*
        Method Name: isAlive
        Method Parameters: None
        Method Description: Provides information about whether or not this entity is alive
        Method Return: boolean, true -> entity is alive, false -> entity is NOT alive
    */
    isAlive(){
        return !this.isDead();
    }

    /*
        Method Name: setDead
        Method Parameters: 
            dead:
                boolean or whether or not the entity is now dead
        Method Description: Sets the dead value to the provided value
        Method Return: void
    */
    setDead(dead){
        this.dead = dead;
    }

    /*
        Method Name: die
        Method Parameters: None
        Method Description: Sets the dead value to true
        Method Return: void
    */
    die(){
        this.setDead(true);
    }

    /*
        Method Name: kill
        Method Parameters: None
        Method Description: Sets the dead value to true
        Method Return: void
    */
    kill(){
        this.die();
    }

    /*
        Method Name: getGame
        Method Parameters: None
        Method Description: Getter
        Method Return: Scene
    */
    getGame(){
        return this.gamemode;
    }

    /*
        Method Name: distance
        Method Parameters:
            entity:
                Another entity
        Method Description: Calculates the euclidian distance between this entity and another entity
        Method Return: float
    */
    distance(entity){
        return this.distanceToPoint(entity.getX(), entity.getY());
    }

    /*
        Method Name: distanceToPoint
        Method Parameters:
            x:
                x location
            y:
                y location
        Method Description: Calculates the euclidian distance between this entity and a point
        Method Return: float
    */
    distanceToPoint(x, y){
        return Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    }


    /*
        Method Name: setX
        Method Parameters:
            x:
                New x value to take
        Method Description: Sets the x value to the given value
        Method Return: void
    */
    setX(x){
        this.setCenterX(x);
    }

    /*
        Method Name: setY
        Method Parameters:
            y:
                New y value to take
        Method Description: Sets the y value to the given value
        Method Return: void
    */
    setY(y){
        this.setCenterY(y);
    }

    /*
        Method Name: setCenterX
        Method Parameters:
            x:
                New x value to take
        Method Description: Sets the x value to the given value
        Method Return: void
    */
    setCenterX(x){
        this.x = x;
    }

    /*
        Method Name: setCenterY
        Method Parameters:
            y:
                New y value to take
        Method Description: Sets the y value to the given value
        Method Return: void
    */
    setCenterY(y){
        this.y = y;
    }

    /*
        Method Name: setID
        Method Parameters:
            id:
                New id value to take
        Method Description: Sets the id value to the given value
        Method Return: void
    */
    setID(id){
        this.id = id;
    }

    /*
        Method Name: getID
        Method Parameters: None
        Method Description: Getter
        Method Return: String
    */
    getID(){
        return this.id;
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getX(){
        return this.getCenterX();
    }

    /*
        Method Name: getCenterX
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getCenterX(){
        return this.x;
    }

    /*
        Method Name: getY
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getY(){
        return this.y;
    }

    /*
        Method Name: getCenterY
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getCenterY(){
        return this.y;
    }

    /*
        Method Name: touchesRegion
        Method Parameters: None
        Method Description: Determines whether or not the image of this entity collides with a given rectangle
        Method Return: boolean, true -> touches, false -> does not touch
    */
    touchesRegion(lX, rX, bY, tY){
        let x = this.getInterpolatedX();
        let width = this.getWidth();
        let lowerX = x - width / 2;
        let higherX = x + width / 2;
        let middleX = x;
        let withinX = (lowerX >= lX && lowerX <= rX) || (higherX >= lX && higherX <= rX) || (middleX >= lX && middleX <= rX);
        
        let y = this.getInterpolatedY();
        let height = this.getHeight();
        let lowerY = y - height / 2;
        let higherY = y + height / 2;
        let middleY = y;
        let withinY = (lowerY >= bY && lowerY <= tY) || (higherY >= bY && higherY <= tY) || (middleY >= bY && middleY <= tY);
        return withinX && withinY;
    }

    /*
        Method Name: delete
        Method Parameters: None
        Method Description: Deletes this entity
        Method Return: void
    */
    delete(){
        this.gamemode.getScene().delete(this.id);
    }

    // These methods will likely be overridden

    /*
        Method Name: goodToFollow
        Method Parameters: None
        Method Description: Determines whether this entity is good to follow (the camera)
        Method Return: boolean, true -> yes good to follow, false -> no not good to follow
    */
    goodToFollow(){ return false; }
    /*
        Method Name: getDisplayID
        Method Parameters: None
        Method Description: Gets a displayable representation of the entity ID
        Method Return: String
    */
    getDisplayID(){ return this.getID(); }
    /*
        Method Name: hasRadar
        Method Parameters: None
        Method Description: Determines if the entity has a radar object
        Method Return: boolean, true -> has radar, false -> does not have a radar
    */
    hasRadar(){ return false; }

    /*
        Method Name: angleToOtherRAD
        Method Parameters:
            otherEntity:
                Other entity to find an angle to
        Method Description: Determine the angle between two entities. In radians.
        Method Return: Float
    */
    angleToOtherRAD(otherEntity){
        return displacementToRadians(otherEntity.getX() - this.getX(), otherEntity.getY() - this.getY());
    }

    // Abstract Methods
    getWidth(){}
    getHeight(){}
    getImage(){}
    tick(){}
    setGamemode(){}
    display(){}
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = Entity;
}