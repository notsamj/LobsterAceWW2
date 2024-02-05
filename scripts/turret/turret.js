/*
    Class Name: Turret
    Description: Abstract class representing a Turret
    Note: Some of this assumes a stationary turret. Anything that does so is overriden.
*/
class Turret {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                The x location of the turret
            y:
                The y location of the turret
            fov1:
                An angle (degrees) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (degrees) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            scene:
                A Scene object related to the fighter plane
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, fov1, fov2, rateOfFire, scene){
        this.x = x;
        this.y = y;
        this.shootCD = new TickLock(rateOfFire * FILE_DATA["constants"]["BULLET_REDUCTION_COEFFICIENT"] / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.fov1 = fov1;
        this.fov2 = fov2;
        this.scene = scene;
        this.model = "turret";
    }

    /*
        Method Name: tick
        Method Parameters:
            timeDiffMS:
                The time between ticks
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(timeDiffMS){
        this.shootCD.tick();
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getX(){
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
        Method Name: getXVelocity
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getXVelocity(){
        return 0;
    }

    /*
        Method Name: getYVelocity
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getYVelocity(){
        return 0;
    }

    /*
        Method Name: getFov1
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getFov1(){
        return this.fov1;
    }

    /*
        Method Name: getFov2
        Method Parameters: None
        Method Description: Getter
        Method Return: float
    */
    getFov2(){
        return this.fov2;
    }

    /*
        Method Name: shoot
        Method Parameters: None
        Method Description: Shoots the turret, if it is ready and the angle is in an allowed range.
        Method Return: void
    */
    shoot(){
        if (!this.readyToShoot()){ return; }
        let shootingAngle = this.getShootingAngle();
        if (!angleBetweenCWDEG(shootingAngle, this.getFov1(), this.getFov2())){ return; }
        this.shootCD.lock();
        SOUND_MANAGER.play("shoot", this.getX(), this.getY());
        this.scene.addBullet(new Bullet(this.getX(), this.getY(), this.scene, this.getXVelocity(), this.getYVelocity(), this.getShootingAngle(), this.getID(), this.model));
    }

    // TODO COmments
    readyToShoot(){
        return this.shootCD.isReady();
    }

    // Abstract
    getShootingAngle(){}
    getID(){}
}