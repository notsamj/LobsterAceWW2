// TODO: This class needs comments
class BotBomberTurret extends BomberTurret {
    constructor(xOffset, yOffset,fov1, fov2, rateOfFire, scene, plane){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, scene, plane);
        this.shootingAngle = 0;
    }

    getNoseAngle(){
        return this.shootingAngle;
    }

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
        Method Description: Turn the plane in a given direction. True if shot, false if not.
        Method Return: boolean
    */
    tryToShootAtEnemy(distanceToEnemy){
        // If ready to shoot and the angle & distance are acceptable then shoot
        if (distanceToEnemy < this.plane.getMaxShootingDistance()){
            this.shoot();
        }
        // Using the locking of the shoot cooldown to determine if a shot was fired
        return this.shootCD.notReady();
    }

    static create(gunObject, scene, plane){
        return new BotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], gunObject["fov_1"], gunObject["fov_2"], gunObject["rate_of_fire"], scene, plane);
    }
}