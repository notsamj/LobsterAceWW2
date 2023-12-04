const SHOOT_DISTANCE_CONSTANT = 5;
const CLOSE_TO_GROUND_CONSTANT = 3;
const CLOSE_CONSTANT = 3;
const ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT = 20;
const TURN_TO_ENEMY_CONSTANT = 0.75; // Maybe 0.75 is good?
const ENEMY_TAKEN_DISTANCE_MULTIPLIER = 5;
const INCENTIVE_TURN_INERTIA = 5;
const EVASIVE_TIME_TO_CATCH = 20;
const EVASIVE_SPEED_DIFF = 4;
class BotFighterPlane extends FighterPlane{
    constructor(planeClass, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        //this.throttle = 1;
        //this.speed = 0;
        this.currentEnemyID = null;
        this.health = 100;
        this.turningDirection = null;
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
        //console.log(angleDEG, this.planeClass, enemyXDisplacement, enemyYDisplacement, Math.atan(enemyYDisplacement / enemyXDisplacement))

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleDEG, distanceToEnemy, enemy);
        // Shoot if the enemy is in front
        this.tryToShootAtEnemy(angleDifference, enemy.getHitbox().getRadius(), distanceToEnemy);
        // Determine what to do (other than shoot)
    }

    handleMovement(angleDEG, distance, enemy){
        if (this.closeToGround() && angleBetweenDEG(this.getShootingAngle(), 180, 359)){
            this.turnToEnemy(90);
            return;
        }

        // Keep going in whatever direction if too close
        /*if (distance < this.speed * CLOSE_CONSTANT){
            return;
        }*/

        // Point to enemy when very far away
        if (distance > this.speed * ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT * TURN_TO_ENEMY_CONSTANT){
            this.turnToEnemy(angleDEG);
            this.turningDirection = null; // Evasive maneuevers cut off if far away
            return;
        }

        // Else at a medium distance to enemy
        this.handleClose(angleDEG, distance, enemy);
    }

    handleClose(angleDEG, distance, enemy){
        // If enemy is behind, so evasive manuevers
        let myAngle = this.getShootingAngle();
        if (angleBetweenDEG(angleDEG, rotateCWDEG(myAngle, 135), rotateCCWDEG(myAngle, 135)) && distance < this.getMaxSpeed() * EVASIVE_SPEED_DIFF){
            this.evasiveManeuver(enemy, distance);
            return;
        }
        // Not doing evausive maneuevers
        this.turningDirection = null;
        this.turnToEnemy(angleDEG);
    }

    comeUpWithEvasiveTurningDirection(enemy, distance){
        return (randomNumberInclusive(1, 2) == 1) ? 1 : -1;
    }

    evasiveManeuver(enemy, distance){
        if (this.turningDirection == null){
            this.turningDirection = this.comeUpWithEvasiveTurningDirection(enemy, distance);
        }
        this.adjustAngle(this.turningDirection);
    }

    closeToGround(){
        return this.y < CLOSE_TO_GROUND_CONSTANT * this.speed;
    }

    turnToEnemy(angleDEG){
        // Determine if we need to switch from left to right
        let myAngle = this.getShootingAngle();
        if (this.facingRight && angleDEG > 135 && angleDEG < 225 && ((myAngle > 315 && myAngle < 360) || (myAngle >= 0 && myAngle < 45))){
            this.face(false);
        }else if (!this.facingRight && (angleDEG > 295 && angleDEG < 0) || angleDEG < 45 && myAngle >= 135 && myAngle <= 225){
            this.face(true);
        }
        myAngle = this.getShootingAngle();
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

    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemyID != null && scene.hasEntity(this.currentEnemyID) && this.distance(scene.getEntity(this.currentEnemyID)) <= ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT * this.speed){
            return;
        }
        let entities = copyArray(scene.getEntities());
        let bestRecord = null;
        for (let entity of entities){
            if (entity instanceof FighterPlane && !this.onSameTeam(entity)){
                let distance = this.distance(entity);
                if (bestRecord == null || distance < bestRecord["score"]){
                    bestRecord = {
                        "id": entity.getID(),
                        "score": distance * (isFocused(entity.getID(), this.getID()) ? ENEMY_TAKEN_DISTANCE_MULTIPLIER : 1)
                    }
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemyID = bestRecord["id"];
    }

    hasCurrentEnemy(){
        return this.currentEnemyID != null && scene.hasEntity(this.currentEnemyID);
    }

    getCurrentEnemy(){
        return this.currentEnemyID;
    }

    onSameTeam(otherPlane){
        return onSameTeam(this.getPlaneClass(), otherPlane.getPlaneClass());
    }


}

function getMaxShootingDistance(){
    return SHOOT_DISTANCE_CONSTANT * fileData["bullet_data"]["speed"];
}

function isFocused(enemyID, myID){
    for (let entity of scene.getEntities()){
        if (entity instanceof BotFighterPlane && entity.getID() != myID && entity.getCurrentEnemy() == enemyID){
            return true;
        }
    }
    return false;
}