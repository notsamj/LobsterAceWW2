const SHOOT_DISTANCE_CONSTANT = 5;
const CLOSE_TO_GROUND_CONSTANT = 3;
const CLOSE_CONSTANT = 3;
const ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT = 20;
const TURN_TO_ENEMY_CONSTANT = 0.75; // Maybe 0.75 is good?
const ENEMY_TAKEN_DISTANCE_MULTIPLIER = 5;
const INCENTIVE_TURN_INERTIA = 5;
const EVASIVE_TIME_TO_CATCH = 20;
const EVASIVE_SPEED_DIFF = 4;
const MIN_ANGLE_TO_ADJUST = 3;
class BotFighterPlane extends FighterPlane{
    constructor(planeClass, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        //this.throttle = 1;
        //this.speed = 0;
        this.currentEnemyID = null;
        this.turningDirection = null;
        this.ticksOnCourse = 0;
        this.tickCD = 0;
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
        let shootingAngle = this.getShootingAngle();
        let angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
        let angleDifference = calculateAngleDiffDEG(shootingAngle, angleDEG);
        //console.log(angleDEG, this.planeClass, enemyXDisplacement, enemyYDisplacement, Math.atan(enemyYDisplacement / enemyXDisplacement))

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleDEG, distanceToEnemy, enemy);
        // Shoot if the enemy is in front
        let hasFiredShot = this.tryToShootAtEnemy(angleDifference, enemy.getHitbox().getRadius(), distanceToEnemy);
        for (let secondaryEnemy of this.getEnemyList()){
            if (hasFiredShot){ break; }
            enemyX = secondaryEnemy.getX();
            enemyY = secondaryEnemy.getY();
            enemyXDisplacement = enemyX - myX;
            enemyYDisplacement = enemyY - myY;
            angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
            angleDifference = calculateAngleDiffDEG(shootingAngle, angleDEG);
            distanceToEnemy = this.distance(secondaryEnemy);
            hasFiredShot = this.tryToShootAtEnemy(angleDifference, secondaryEnemy.getHitbox().getRadius(), distanceToEnemy);
        }
    }

    handleMovement(angleDEG, distance, enemy){
        if (this.closeToGround() && angleBetweenDEG(this.getShootingAngle(), 180, 359)){
            this.turnInDirection(90);
            return;
        }

        // Point to enemy when very far away
        if (distance > this.speed * ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT * TURN_TO_ENEMY_CONSTANT){
            this.turnInDirection(angleDEG);
            this.turningDirection = null; // Evasive maneuevers cut off if far away
            return;
        }

        // Else at a medium distance to enemy
        this.handleClose(angleDEG, distance, enemy);
    }

    handleClose(angleDEG, distance, enemy){
        let myAngle = this.getShootingAngle();
        // If enemy is behind, so evasive manuevers
        if (angleBetweenDEG(angleDEG, rotateCWDEG(myAngle, 135), rotateCCWDEG(myAngle, 135)) && distance < this.getMaxSpeed() * EVASIVE_SPEED_DIFF){
            this.evasiveManeuver(enemy, distance);
            return;
        }
        // If on a movement cooldown
        if (this.tickCD-- > 0){
            return;
        }
        // Not doing evausive maneuevers
        // If we have been chasing the enemy non-stop for too long at a close distance then move away (circles)
        if (this.ticksOnCourse >= fileData["ai"]["max_ticks_on_course"]){
            this.tickCD = fileData["ai"]["tick_cd"];
            this.ticksOnCourse = 0;
        }
        this.turningDirection = null;
        this.ticksOnCourse += 1;
        this.turnInDirection(angleDEG);
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

    turnInDirection(angleDEG){
        // Determine if we need to switch from left to right
        let myAngle = this.getShootingAngle();
        // TODO: Change this to use the easy function from helperfunctionss
        if (this.facingRight && angleBetweenDEG(angleDEG, 135, 225) && angleBetweenDEG(myAngle, 315, 45)){
            this.face(false);
        }else if (!this.facingRight && angleBetweenDEG(angleDEG, 295, 0) || angleDEG < 45 && myAngle >= 135 && myAngle <= 225){
            this.face(true);
        }
        myAngle = this.getShootingAngle();
        let newAngleCW = fixDegrees(this.getShootingAngle() + 1);
        let newAngleCCW = fixDegrees(this.getShootingAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < MIN_ANGLE_TO_ADJUST && calculateAngleDiffDEG(newAngleCCW, angleDEG) < MIN_ANGLE_TO_ADJUST){
            return;
        }
        if (dCW < dCCW && this.facingRight){
            this.adjustAngle(1);
        }else if (dCW < dCCW && !this.facingRight){
            this.adjustAngle(-1);
        }else if (dCCW < dCW && this.facingRight){
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
        if (this.shootLock.isReady() && angleDifference < angleAllowanceAtRangeDEG && distanceToEnemy < this.getMaxShootingDistance()){
            this.shootLock.lock();
            this.shoot();
            return true;
        }
        return false;
    }

    getEnemyList(){
        let entities = scene.getEntities();
        let enemies = [];
        for (let entity of entities){
            if (entity instanceof FighterPlane && !this.onSameTeam(entity)){
                enemies.push(entity);
            }
        }
        return enemies;
    }

    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemyID != null && scene.hasEntity(this.currentEnemyID) && this.distance(scene.getEntity(this.currentEnemyID)) <= ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            if (bestRecord == null || distance < bestRecord["score"]){
                bestRecord = {
                    "id": enemy.getID(),
                    "score": distance * (isFocused(enemy.getID(), this.getID()) ? ENEMY_TAKEN_DISTANCE_MULTIPLIER : 1)
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

    getMaxShootingDistance(){
        return SHOOT_DISTANCE_CONSTANT * fileData["bullet_data"]["speed"];
    }
}

function isFocused(enemyID, myID){
    for (let entity of scene.getEntities()){
        if (entity instanceof BotFighterPlane && entity.getID() != myID && entity.getCurrentEnemy() == enemyID){
            return true;
        }
    }
    return false;
}