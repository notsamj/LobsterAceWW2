class BiasedBotFighterPlane extends BotFighterPlane{
    constructor(planeClass, biases, angle=0, facingRight=true){
        super(planeClass, angle, facingRight);
        this.biases = biases;
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
        // Bias
        distanceToEnemy += this.biases["distance_to_enemy"];
        // To prevent issues in calculating angles, if the enemy is ontop of you just shoot and do nothing else
        if (distanceToEnemy < 1){
            this.tryToShootAtEnemy(0, 1, 1);
            return;
        }
        // Otherwise enemy is not too much "on top" of the bot
        let shootingAngle = this.getShootingAngle();
        let angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
        // Bias
        angleDEG = fixDegrees(angleDEG + this.biases["angle_to_enemy"]);
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
            angleDEG = fixDegrees(angleDEG + this.biases["angle_to_enemy"]);
            angleDifference = calculateAngleDiffDEG(shootingAngle, angleDEG);
            distanceToEnemy = this.distance(secondaryEnemy);
            hasFiredShot = this.tryToShootAtEnemy(angleDifference, secondaryEnemy.getHitbox().getRadius(), distanceToEnemy);
        }
    }

    handleMovement(angleDEG, distance, enemy){
        if (this.closeToGround() && angleBetweenDEG(this.getShootingAngle(), 180, 359)){
            // Bias
            this.turnInDirection(fixDegrees(90 + this.biases["angle_from_ground"]));
            return;
        }

        // Point to enemy when very far away
        if (distance > this.speed * ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT * TURN_TO_ENEMY_CONSTANT + this.biases["enemy_far_away_distance"]){
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
        if (angleBetweenDEG(angleDEG, rotateCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"])), rotateCCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"]))) && distance < this.getMaxSpeed() * EVASIVE_SPEED_DIFF + this.biases["enemy_close"]){
            this.evasiveManeuver(enemy, distance);
            return;
        }
        // If on a movement cooldown
        if (this.tickCD-- > 0){
            return;
        }
        // Not doing evausive maneuevers
        // If we have been chasing the enemy non-stop for too long at a close distance then move away (circles)
        if (this.ticksOnCourse >= fileData["ai"]["max_ticks_on_course"] + this.biases["max_ticks_on_course"]){
            this.tickCD = fileData["ai"]["tick_cd"] + this.biases["ticks_cooldown"];
            this.ticksOnCourse = 0;
        }
        this.turningDirection = null;
        this.ticksOnCourse += 1;
        this.turnInDirection(angleDEG);
    }

    comeUpWithEvasiveTurningDirection(enemy, distance){
        return (randomNumberInclusive(1, 100) + this.biases["turn_direction"] <= 50) ? 1 : -1;
    }

    evasiveManeuver(enemy, distance){
        if (this.turningDirection == null){
            this.turningDirection = this.comeUpWithEvasiveTurningDirection(enemy, distance);
        }
        this.adjustAngle(this.turningDirection);
    }

    closeToGround(){
        return this.y < CLOSE_TO_GROUND_CONSTANT * this.speed + this.biases["close_to_ground"];
    }

    turnInDirection(angleDEG){
        // Determine if we need to switch from left to right
        let myAngle = this.getShootingAngle();
        // TODO: Change this to use the easy function from helperfunctionss
        if (this.facingRight && angleDEG > 135 && angleDEG < 225 && ((myAngle > 315 && myAngle < 360) || (myAngle >= 0 && myAngle < 45))){
            this.face(false);
        }else if (!this.facingRight && (angleDEG > 295 && angleDEG < 0) || angleDEG < 45 && myAngle >= 135 && myAngle <= 225){
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

    getMaxShootingDistance(){
        return SHOOT_DISTANCE_CONSTANT * fileData["bullet_data"]["speed"];
    }
}