const SHOOT_DISTANCE_CONSTANT = 5;
const FAR_AWAY_DISTANCE = 4000;
class BotFighterPlane extends FighterPlane{
    constructor(planeClass, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        //this.throttle = 1;
        //this.speed = 0;
        this.currentEnemyID = null;
    }

    tick(timeDiffMS){
        super.tick(timeDiffMS);
        this.updateEnemy();
        if (this.hasCurrentEnemy()){
            let enemy = scene.getEntity(this.currentEnemyID);
            this.handleEnemy(enemy);
        }
    }

    handleEnemy(enemy){
        // Separate into two things
        // 1. Shooting if close enough 2. Determining how to move.
        let myX = this.getX();
        let myY = this.getY();
        let enemyX = enemy.getX();
        let enemyY = enemy.getY();
        let enemyXDisplacement = enemyX - myX;
        let enemyYDisplacement = enemyY - myY;
        let distanceToEnemy = this.distance(enemy);
        // To prevent issues in calculating angles, if the enemy is ontop of you just shoot and do nothing else
        if (distanceToEnemy < 1){
            this.tryToShootAtEnemy(0, 1, 1);
            return;
        }
        // Otherwise enemy is not too much "on top" of the bot
        let angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
        let angleDifference = calculateAngleDiffDEG(this.getShootingAngle(), angleDEG);
        console.log(angleDEG, this.planeClass, enemyXDisplacement, enemyYDisplacement, Math.atan(enemyYDisplacement / enemyXDisplacement))

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleDEG, distanceToEnemy, enemy);
        // Shoot if the enemy is in front
        this.tryToShootAtEnemy(angleDifference, enemy.getHitbox().getRadius(), distanceToEnemy);
        // Determine what to do (other than shoot)
    }

    handleMovement(angleDEG, distance, enemy){
        // Seems to be working
        if (distance > FAR_AWAY_DISTANCE){
            this.turnToEnemy(angleDEG);
            return;
        }
        
    }

    turnToEnemy(angleDEG){
        // Determine if we need to switch from left to right
        if (this.facingRight && angleDEG > 135 && angleDEG < 225){
            this.face(false);
        }else if (!this.facingRight && (angleDEG > 295 && angleDEG < 0) || angleDEG < 45){
            this.face(true);
        }

        let newAngleCW = this.getShootingAngle() + 1;
        let newAngleCCW = this.getShootingAngle() - 1;
        while (newAngleCW > 360){
            newAngleCW -= 360;
        }
        while (newAngleCCW < 0){
            newAngleCCW += 360;
        }
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < 2 && calculateAngleDiffDEG(newAngleCCW, angleDEG) < 2){
            return;
        }
        let consoleLog1 = "";
        if (dCW < dCCW && this.facingRight){
            this.adjustAngle(1);
        }else if (dCW < dCCW && !this.facingRight){
            this.adjustAngle(-1);
        }else if (dCCW < dCW && this.facingRight){
            let angleB4 = this.angle;
            this.adjustAngle(-1);
        }else if (dCCW < dCW && !this.facingRight){
            this.adjustAngle(1);
        }else{
            this.adjustAngle(1);
        }
        //console.log(this.planeClass, newAngleCW, newAngleCCW, angleDEG, dCW, dCCW, consoleLog1)

    }

    tryToShootAtEnemy(angleDifference, enemyRadius, distanceToEnemy){
        let angleAllowanceAtRangeDEG = toDegrees(Math.abs(Math.atan(enemyRadius / distanceToEnemy)));
        if (this.shootLock.isReady() && angleDifference < angleAllowanceAtRangeDEG && distanceToEnemy < getMaxShootingDistance()){
            this.shootLock.lock();
            this.shoot();
        }
    }



    /*attack(enemy){
        //if (enemy.getPlaneClass() == "a6m_zero"){ return; }
        //enemy.throttle = 1;
        let enemyXDisplacement = enemy.getX() - this.getX();
        let enemyYDisplacement = enemy.getY() - this.getY();
        let distanceToEnemy = this.distance(enemy);
        if (distanceToEnemy < 1){ 
            if (this.shootLock.isReady()){
                this.shootLock.lock();
                this.shoot();
            }
            return; 
        }
        let angleRAD = Math.atan(enemyYDisplacement / enemyXDisplacement);
        let originalAngleRAD = angleRAD; // Temp
        // Check for -0
        if (angleRAD == 0 && enemy.getX() < this.getX()){
            angleRAD = Math.PI; 
        }
        // Catch mistake with atan
        if (enemyYDisplacement < 0 && enemyXDisplacement < 0){
            angleRAD += Math.PI / 2;
        }
        let angleDEG = toDegrees(angleRAD);
        while (angleDEG < 0){
            angleDEG += 360;
        }
        while(angleDEG >= 360){
            angleDEG -= 360;
        }
        //console.log(enemy.getX(), enemy.getY(), enemyYDisplacement, enemyYDisplacement, enemy.getX(), enemy.getY(), angleRAD, angleDEG)
        //console.log(angleDEG)
        let angleDifference = Math.abs(this.getShootingAngle() - angleDEG);
        if (angleDifference > 180){
            this.facingRight = !this.facingRight;
            let angleDifference2 = Math.abs(this.getShootingAngle() - angleDEG);
            if (angleDifference2 > angleDifference){
                this.facingRight = !this.facingRight;
                // TODO: probably discarding this whole function BUT if I weren't I would add the actual face all somewhere here so it gets the speed
                // debuff
            }
        }
        if (this.getShootingAngle() < angleDEG && angleDifference > 1){
            this.adjustAngle(1);
        }else if (angleDifference > 1){
            this.adjustAngle(-1);
        }

        let angleAllowanceAtRangeDEG = toDegrees(Math.abs(Math.atan(enemy.getHitbox().getRadius() / distanceToEnemy)));
        //console.log(angleAllowanceAtRangeDEG, angleDifference, this.getShootingAngle(), angleDEG, angleRAD, originalAngleRAD)
        if (this.shootLock.isReady() && angleDifference < angleAllowanceAtRangeDEG && distanceToEnemy < getMaxShootingDistance()){
            this.shootLock.lock();
            this.shoot();
        }
    }*/

    updateEnemy(){
        let entities = copyArray(scene.getEntities());
        let bestRecord = null;
        for (let entity of entities){
            if (entity instanceof FighterPlane && !this.onSameTeam(entity)){
                let distance = this.distance(entity);
                if (bestRecord == null || distance < bestRecord["distance"]){
                    bestRecord = {
                        "id": entity.getID(),
                        "distance": distance
                    }
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemyID = bestRecord["id"];
    }

    hasCurrentEnemy(){
        return scene.hasEntity(this.currentEnemyID);
    }

    onSameTeam(otherPlane){
        return onSameTeam(this.getPlaneClass(), otherPlane.getPlaneClass());
    }


}

function getMaxShootingDistance(){
    return SHOOT_DISTANCE_CONSTANT * fileData["bullet_data"]["speed"];
}