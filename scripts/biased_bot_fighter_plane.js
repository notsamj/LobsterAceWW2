if (typeof window === "undefined"){
    BotFighterPlane = require("../scripts/bot_fighter_plane.js");
    CooldownLock = require("../scripts/lock.js").CooldownLock;
    fileData = require("../data/data_json.js");
}
class BiasedBotFighterPlane extends BotFighterPlane {
    constructor(planeClass, scene, biases, angle=0, facingRight=true){
        super(planeClass, scene, angle, facingRight);
        this.biases = biases;
        let bt = this.throttle;
        this.throttle += this.biases["throttle"];
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.rotationCD = new CooldownLock(this.biases["rotation_time"]);
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
        if (this.closeToGround() && angleBetweenCWDEG(this.getShootingAngle(), 180, 359)){
            // Bias
            this.turnInDirection(fixDegrees(90 + this.biases["angle_from_ground"]));
            return;
        }

        // Point to enemy when very far away
        if (distance > this.speed * fileData["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] * fileData["constants"]["TURN_TO_ENEMY_CONSTANT"] + this.biases["enemy_far_away_distance"]){
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
        if (angleBetweenCWDEG(angleDEG, rotateCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"])), rotateCCWDEG(myAngle, fixDegrees(135 + this.biases["enemy_behind_angle"]))) && distance < this.getMaxSpeed() * fileData["constants"]["EVASIVE_SPEED_DIFF"] + this.biases["enemy_close_distance"]){
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

    adjustAngle(amount){
        if (!this.rotationCD.isReady()){ return; }
        this.rotationCD.lock();
        let newAngle = this.angle;

        // Determine angle
        if (this.facingRight){
            newAngle += amount;
        }else{
            newAngle -= amount;
        }

        while(newAngle >= 360){
            newAngle -= 360;
        }
        while(newAngle < 0){
            newAngle += 360;
        }
        this.angle = Math.floor(newAngle);
    }

    closeToGround(){
        return this.y < fileData["constants"]["CLOSE_TO_GROUND_CONSTANT"] * this.speed + this.biases["close_to_ground"];
    }

    turnInDirection(angleDEG){
        // Determine if we need to switch from left to right
        let myAngle = this.getShootingAngle();
        if (this.facingRight && angleBetweenCWDEG(angleDEG, 135 + this.biases["flip_direction_lb"], 225 + this.biases["flip_direction_ub"]) && angleBetweenCWDEG(myAngle, 315 + this.biases["flip_direction_lb"], 45 + this.biases["flip_direction_ub"])){
            this.face(false);
            return;
        }else if (!this.facingRight && angleBetweenCWDEG(angleDEG, 295 + this.biases["flip_direction_lb"], 45 + this.biases["flip_direction_ub"]) && angleBetweenCWDEG(angleDEG, 135 + this.biases["flip_direction_lb"], 225 + this.biases["flip_direction_ub"])){
            this.face(true);
            return;
        }
        myAngle = this.getShootingAngle();
        let newAngleCW = fixDegrees(this.getShootingAngle() + 1);
        let newAngleCCW = fixDegrees(this.getShootingAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < fileData["constants"]["MIN_ANGLE_TO_ADJUST"] + this.biases["min_angle_to_adjust"] && calculateAngleDiffDEG(newAngleCCW, angleDEG) < fileData["constants"]["MIN_ANGLE_TO_ADJUST"] + this.biases["min_angle_to_adjust"]){
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
        if (this.shootLock.isReady() && angleDifference < angleAllowanceAtRangeDEG + this.biases["angle_allowance_at_range"] && distanceToEnemy < this.getMaxShootingDistance()){
            this.shootLock.lock();
            this.shoot();
            return true;
        }
        return false;
    }

    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemyID != null && scene.hasEntity(this.currentEnemyID) && this.distance(scene.getEntity(this.currentEnemyID)) <= (fileData["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] + this.biases["enemy_disregard_distance_time_constant"]) * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            if (bestRecord == null || distance < bestRecord["score"]){
                bestRecord = {
                    "id": enemy.getID(),
                    "score": distance * (isFocused(enemy.getID(), this.getID()) ? (fileData["constants"]["ENEMY_TAKEN_DISTANCE_MULTIPLIER"] + this.biases["enemy_taken_distance_multiplier"]) : 1)
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemyID = bestRecord["id"];
    }

    getMaxShootingDistance(){
        return fileData["constants"]["SHOOT_DISTANCE_CONSTANT"] * fileData["bullet_data"]["speed"] + this.biases["max_shooting_distance"];
    }

    static createBiasedPlane(planeClass){
        let biases = {};
        for (let [key, bounds] of Object.entries(fileData["ai"]["bias_ranges"])){
            let upperBound = bounds["upper_bound"];
            let lowerBound = bounds["lower_bound"];
            let usesFloatValue = Math.floor(upperBound) != upperBound || Math.floor(lowerBound) != lowerBound;
            biases[key] = usesFloatValue ? randomFloatBetween(lowerBound, upperBound) : randomNumberInclusive(lowerBound, upperBound);    
        }
        return new BiasedBotFighterPlane(planeClass, biases);
    }
}
if (typeof window === "undefined"){
    module.exports = BiasedBotFighterPlane;
}