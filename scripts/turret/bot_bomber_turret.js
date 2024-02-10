/*
    Class Name: BotBomberTurret
    Description: Class representing a Turret attached to a Bomber plane that is operated by the computer
*/
class BotBomberTurret extends BomberTurret {
    /*
        Method Name: constructor
        Method Parameters:
            xOffset:
                The x offset of the turret from the center of the attached plane
            yOfset:
                The y offset of the turret from the center of the attached plane
            fov1:
                An angle (degrees) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (degrees) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            scene:
                A Scene object related to the fighter plane
            plane:
                The bomber plane which the turret is attached to
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset,fov1, fov2, rateOfFire, scene, plane){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane);
        this.shootingAngle = 0;
    }

    /*
        Method Name: getShootingAngle
        Method Parameters: None
        Method Description: Determines the shooting angle of the turret.
        Method Return: int
    */
    getShootingAngle(){
        return this.shootingAngle;
    }

    /*
        Method Name: checkShoot
        Method Parameters:
            enemyList:
                A list of enemy planes
        Method Description: Checks if the turret should shoot. If so, it tries to shoot at the enemy.
        Method Return: void
    */
    checkShoot(enemyList){
        if (this.shootCD.notReady()){ return; }
        // Shoot if the enemy is in front
        let hasFiredShot = false;
        let myX = this.getX();
        let myY = this.getY();
        let enemyX = null;
        let enemyY = null;
        let enemyXDisplacement = null;
        let enemyYDisplacement = null;
        let angleDEG = null;
        let distanceToEnemy = null;
        // Look for other enemies that aren't the primary focus and if they are infront of the plane then shoot
        for (let enemy of enemyList){
            if (hasFiredShot){ break; }
            enemyX = enemy.getX();
            enemyY = enemy.getY();
            enemyXDisplacement = enemyX - myX;
            enemyYDisplacement = enemyY - myY;
            // TODO: Maybe make an ANGLE TO ENTITY function?
            angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
            this.shootingAngle = angleDEG;
            distanceToEnemy = enemy.distanceToPoint(myX, myY);
            hasFiredShot = this.tryToShootAtEnemy(distanceToEnemy);
        }
    }

    /*
        Method Name: tryToShootAtEnemy
        Method Parameters:
            distanceToEnemy:
                The distance to the enemy
        Method Description: Turn the plane in a given direction.
        Method Return: boolean, true if shot, false if not.
    */
    tryToShootAtEnemy(distanceToEnemy){
        // If ready to shoot and the angle & distance are acceptable then shoot
        if (distanceToEnemy < this.plane.getMaxShootingDistance()){
            // Either physics bullets OR don't shoot past the limit of instant shot
            if (FILE_DATA["constants"]["USE_PHYSICS_BULLETS"] || distanceToEnemy < FILE_DATA["constants"]["INSTANT_SHOT_MAX_DISTANCE"]){
                this.shoot();
            }
        }
        // Using the locking of the shoot cooldown to determine if a shot was fired
        return this.shootCD.notReady();
    }

    /*
        Method Name: create
        Method Parameters:
            gunObject:
                A JSON object with details about the gun
            scene:
                A Scene object related to the fighter plane
            plane:
                The bomber plane which the turret is attached to
        Method Description: Create a bot bomber turret
        Method Return: BotBomberTurret
    */
    static create(gunObject, scene, plane){
        return new BotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], scene, plane);
    }
}