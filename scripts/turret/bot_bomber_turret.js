// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    BomberTurret = require("./bomber_turret.js");
    helperFunctions = require("../general/helper_functions.js");
    angleBetweenCWRAD = helperFunctions.angleBetweenCWRAD;
    displacementToDegrees = helperFunctions.displacementToDegrees;
}
/*
    Class Name: BotBomberTurret
    Description: Abstract Class representing a Turret attached to a Bomber plane that is operated by the computer
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
                An angle (radians) representing an edge of an angle which the turret can shoot within
            fov2:
                An angle (radians) representing an edge of an angle which the turret can shoot within (second edge in a clockwise direction)
            rateOfFire:
                The number of milliseconds between shots that the turret can take
            gamemode:
                A gamemode object involving the bot bomber turret
            plane:
                The bomber plane which the turret is attached to
            bulletHeatCapacity:
                The heat capacity of the turret
            coolingTimeMS:
                The time in miliseconds for the turret to fully cool down
            bulletDamage:
                The damage of bullets shot from this turret
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(xOffset, yOffset,fov1, fov2, rateOfFire, plane, bulletHeatCapacity, coolingTimeMS, bulletDamage){
        super(xOffset, yOffset, fov1, fov2, rateOfFire, plane, bulletHeatCapacity, coolingTimeMS, bulletDamage);
    }

    /*
        Method Name: makeDecisions
        Method Parameters:
            enemyList:
                A list of enemy planes
        Method Description: Makes decisions for what to do in the next tick
        Method Return: void
    */
    makeDecisions(enemyList){
        // If it can't make its own decisions then skip this
        if (!this.isAutonomous()){ return; }
        this.resetDecisions();
        this.checkShoot(enemyList);
    }

    /*
        Method Name: checkShoot
        Method Parameters:
            enemyList:
                A list of enemy planes
        Method Description: Checks if the turret should shoot. If so, it makes the decision to shoot at the enemy.
        Method Return: void
    */
    checkShoot(enemyList){
        // Shoot if the enemy is in front
        let hasDecidedToFireShot = false;
        let myX = this.getX();
        let myY = this.getY();
        let enemyX = null;
        let enemyY = null;
        let enemyXDisplacement = null;
        let enemyYDisplacement = null;
        let angleRAD = null;
        let distanceToEnemy = null;
        let fov1 = this.getFov1();
        let fov2 = this.getFov2();

        // Look for other enemies that aren't the primary focus and if they are infront of the plane then shoot
        for (let enemy of enemyList){
            enemyX = enemy.getX();
            enemyY = enemy.getY();
            enemyXDisplacement = enemyX - myX;
            enemyYDisplacement = enemyY - myY;
            angleRAD = displacementToRadians(enemyXDisplacement, enemyYDisplacement);
            // Ignore planes that aren't in line of sight
            if (!angleBetweenCWRAD(angleRAD, fov1, fov2)){ 
                continue; 
            }
            distanceToEnemy = enemy.distanceToPoint(myX, myY);
            hasDecidedToFireShot = this.isEnemyClose(distanceToEnemy);
            if (hasDecidedToFireShot){ break; }
        }
        // If the decision has been made to shoot then record it
        if (hasDecidedToFireShot){
            // Check gun heat
            let blockedByGunHeat = false;
            let currentThreshold = this.turretHeatManager.getThreshold();
            // Bots won't shoot far away enemies if their gun is too hot, its a waste
            if (currentThreshold == "threshold_3"){
                blockedByGunHeat = distanceToEnemy >= PROGRAM_DATA["ai"]["threshold_3_distance"];
            }else if (currentThreshold == "threshold_2"){
                blockedByGunHeat = distanceToEnemy >= PROGRAM_DATA["ai"]["threshold_2_distance"];
            }
            this.decisions["angle"] = angleRAD;
            this.decisions["shooting"] = !blockedByGunHeat;
        }
    }

    /*
        Method Name: isEnemyClose
        Method Parameters:
            distanceToEnemy:
                The distance to the enemy
        Method Description: Turn the plane in a given direction.
        Method Return: boolean, true if shot, false if not.
    */
    isEnemyClose(distanceToEnemy){
        // If the distance is acceptable then the shot is good
        if (distanceToEnemy < this.plane.getMaxShootingDistance()){
            // Either physics bullets OR don't shoot past the limit of instant shot
            if (this.getGamemode().areBulletPhysicsEnabled() || distanceToEnemy < PROGRAM_DATA["settings"]["instant_shot_max_distance"]){
                return true;
            }
        }
        return false;
    }

    /*
        Method Name: create
        Method Parameters:
            gunObject:
                A JSON object with details about the gun
            plane:
                The bomber plane which the turret is attached to
        Method Description: Create a bot bomber turret
        Method Return: BotBomberTurret
    */
    static create(gunObject, plane){
        return new BotBomberTurret(gunObject["x_offset"], gunObject["y_offset"], toRadians(gunObject["fov_1"]), toRadians(gunObject["fov_2"]), gunObject["rate_of_fire"], plane);
    }
}

// If using NodeJS -> Export the class
if (typeof window === "undefined"){
    module.exports = BotBomberTurret;
}