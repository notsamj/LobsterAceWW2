// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    FighterPlane = require("../scripts/fighter_plane.js");
}
/*
    Class Name: MultiplayerRemoteFighterPlane
    Description: A subclass of the FighterPlane that receieves stats and actions from a remote source
*/
class MultiplayerRemoteFighterPlane extends FighterPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            gameMode:
                The game mode instance attached to the fighter plane
            rotationTime:
                The time it takes to rotate the plane
            speed:
                The current speed of the plane
            maxSpeed:
                The maximum speed of the plane
            throttleConstant:
                The throttle constant of the plane
            health:
                The health of a plane
            lastActions:
                A json object with the last actions of a plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, gameMode, rotationTime, speed, maxSpeed, throttleConstant, health, lastActions, angle, facingRight){
        super(planeClass, scene, angle, facingRight);
        this.maxSpeed = maxSpeed;
        this.speed = speed;
        this.throttleConstant = throttleConstant;
        this.rotationCD = new CooldownLock(rotationTime);
        this.health = health;
        this.lastActions = lastActions;
        this.gameMode = gameMode;
    }

    /*
        Method Name: setLastActions
        Method Parameters: 
            lastActions:
                JSON object of last actions
        Method Description: Setter
        Method Return: void
    */
    setLastActions(lastActions){
        this.lastActions = lastActions;
    }

    /*
        Method Name: setGameMode
        Method Parameters: 
            gameMode:
                GameMode instance
        Method Description: Setter
        Method Return: void
    */
    setGameMode(gameMode){
        this.gameMode = gameMode;
    }

    /*
        Method Name: update
        Method Parameters: 
            newStats:
                JSon object of new stats
        Method Description: Copys JSON stats to the stats of this plane
        Method Return: void
    */
    update(newStats){
        this.dead = newStats["isDead"];
        this.x = newStats["x"];
        this.y = newStats["y"];
        this.facingRight = newStats["facing"];
        this.angle = newStats["angle"];
        this.speed = newStats["speed"];
        this.throttle = newStats["throttle"];
        this.health = newStats["health"];
        this.lastActions = newStats["lastActions"];
    }

    /*
        Method Name: adjustByLastActions
        Method Parameters: None
        Method Description: Adjust stats based on saved actions
        Method Return: void
    */
    adjustByLastActions(){
        if (this.lastActions["shooting"] && this.shootLock.isReady()){
            this.shootLock.lock();
            this.shoot();
        }
        this.adjustAngle(this.lastActions["turn"]);
        if (this.facingRight != this.lastActions["face"]){
            this.face(this.lastActions["face"])
        }
        this.throttle += this.lastActions["throttle"];
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiffMS:
                The time between ticks
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(timeMS){
        this.adjustByLastActions();
        super.tick(timeMS);
    }
}
// If using NodeJS then export the class
if (typeof window === "undefined"){
    module.exports=MultiplayerRemoteFighterPlane;
}