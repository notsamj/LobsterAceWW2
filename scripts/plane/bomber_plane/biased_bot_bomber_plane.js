/*
    Class Name: BiasedBotBomberPlane
    Description: A subclass of the BomberPlane that is a bot with biases for its actions
*/
class BiasedBotBomberPlane extends BomberPlane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
            biases:
                An object containing keys and bias values
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle, facingRight, biases){
        super(planeClass, scene, angle, facingRight);
        this.currentEnemy = null;
        this.udLock = new TickLock(40 / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.updateEnemyLock = new TickLock(FILE_DATA["ai"]["fighter_plane"]["update_enemy_cooldown"] / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.biases = biases;
        this.generateGuns(biases);
    }

    /*
        Method Name: getFriendlyList
        Method Parameters: None
        Method Description: Creates a list of all friendly planes
        Method Return: List of planes
    */
    getFriendlyList(){
        let entities = this.scene.getPlanes();
        let enemies = [];
        for (let entity of entities){
            if (entity instanceof Plane && this.onSameTeam(entity) && entity.isAlive()){
                enemies.push(entity);
            }
        }
        return enemies;
    }

    /*
        Method Name: checkGuns
        Method Parameters: None
        Method Description: Checks if each gun on the bomber plane can shoot
        Method Return: void
    */
    checkGuns(){
        let enemyList = this.getEnemyList();
        for (let gun of this.guns){
            gun.checkShoot(enemyList);
        }
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
        this.udLock.tick();
        this.updateEnemyLock.tick();
        for (let gun of this.guns){
            gun.tick();
        }
        let centerOfFriendyMass = this.findFriendlyCenter();
        // If there are friendlies then the top priority is to be near them
        if (!centerOfFriendyMass["empty"]){
            let distance = this.distanceToPoint(centerOfFriendyMass["centerX"], centerOfFriendyMass["centerY"]);
            // If we are far from friendlies then move to their center
            if (distance > FILE_DATA["constants"]["BOMBER_DISTANCE_FROM_FRIENDLIES_DOGFIGHT"]){
                let angleDEG = displacementToDegrees(centerOfFriendyMass["centerX"] - this.x, centerOfFriendyMass["centerY"] - this.y);
                this.turnInDirection(angleDEG);
            }
            this.checkGuns();
        }
        // Otherwise we are just looking for enemies

        if (this.updateEnemyLock.isReady()){
            this.updateEnemyLock.lock();
            // Check if the selected enemy should be changed
            this.updateEnemy();
        }
        // If there is an enemy then act accordingly
        if (this.hasCurrentEnemy()){
            let enemy = this.currentEnemy;
            this.handleEnemy(enemy);
            this.checkGuns();
        }else{ // No enemy -> make sure not to crash into the ground
            if (this.closeToGround() && angleBetweenCCWDEG(this.getNoseAngle(), 180, 359)){
                this.turnInDirection(90);
                this.checkGuns();
            }
        }
        super.tick(timeDiffMS);
    }

    /*
        Method Name: generateGuns
        Method Parameters: None
        Method Description: Create gun objects for the plane
        Method Return: void
    */
    generateGuns(biases){
        this.guns = [];
        for (let gunObj of FILE_DATA["plane_data"][this.planeClass]["guns"]){
            this.guns.push(BiasedBotBomberTurret.create(gunObj, this.scene, this, biases));
        }
    }

    /*
        Method Name: createBiasedPlane
        Method Parameters: 
            planeClass:
                A string representing the type of the plane
            scene:
                A scene objet related to the plane
            difficulty:
                The current difficulty setting
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    static createBiasedPlane(planeClass, scene, difficulty){
        let biases = {};
        for (let [key, bounds] of Object.entries(FILE_DATA["ai"]["bomber_plane"]["bias_ranges"][difficulty])){
            let upperBound = bounds["upper_range"]["upper_bound"];
            let lowerBound = bounds["upper_range"]["lower_bound"];
            let upperRangeSize = bounds["upper_range"]["upper_bound"] - bounds["upper_range"]["lower_bound"];
            let lowerRangeSize = bounds["lower_range"]["upper_bound"] - bounds["lower_range"]["lower_bound"];
            // Chance of using the lower range instead of the upper range
            if (randomFloatBetween(0, upperRangeSize + lowerRangeSize) < lowerRangeSize){
                upperBound = bounds["lower_range"]["upper_bound"];
                lowerBound = bounds["lower_range"]["lower_bound"];
            }
            let usesFloatValue = Math.floor(upperBound) != upperBound || Math.floor(lowerBound) != lowerBound;
            biases[key] = usesFloatValue ? randomFloatBetween(lowerBound, upperBound) : randomNumberInclusive(lowerBound, upperBound);    
        }
        return new BiasedBotBomberPlane(planeClass, scene, true, 0, biases); // Temporary values some will be changed
    }

    /*
        Method Name: findFriendlyCenter
        Method Parameters: None
        Method Description: Finds the center location of all friendly planes (excluding bombers)
        Method Return: JSON Object
    */
    findFriendlyCenter(){
        let totalX = 0;
        let totalY = 0;
        let friendlies = this.getFriendlyList();
        if (friendlies.length == 0){
            return {"empty": true};
        }
        let fC = 0;
        // Loop through all friendlies and determine the center of them
        for (let friendly of friendlies){
            if (friendly instanceof BotBomberPlane){ continue; } // bot bomber's don't count so we don't end up in a loop
            totalX += friendly.getX();
            totalY += friendly.getY();
            fC++;
        }
        if (fC == 0){ return {"empty": true}; }
        return {"empty": false, "centerX": totalX/fC + this.biases["friendly_center_x_offset"], "centerY": totalY/fC + this.biases["friendly_center_y_offset"]};
    }

    /*
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return FILE_DATA["constants"]["SHOOT_DISTANCE_CONSTANT"] * FILE_DATA["bullet_data"]["speed"] + this.biases["max_shooting_distance_offset"];
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemy != null && this.currentEnemy.isAlive() && this.distance(this.currentEnemy) <= FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;
        // Loop through all enemies and determine a score for being good to attack
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            // TODO: Update when this becomes BiasedBotDogfightFighterPlane
            let focusedCountMultiplier = (BiasedBotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID()) * FILE_DATA["constants"]["ENEMY_DISTANCE_SCORE_MULTIPLIER_BASE"]);
            if (focusedCountMultiplier < 1 ){ focusedCountMultiplier = 1; }
            let score = distance / focusedCountMultiplier; // Most focusing the better (from POV of bomber)

            // If this new enemy is better
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "enemy": enemy,
                    "score": score
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemy = bestRecord["enemy"];
    }

    /*
        Method Name: handleEnemy
        Method Parameters:
            enemy:
                An object of an enemy plane
        Method Description: Decide what to do when given an enemy to attack. Can move and can shoot.
        Method Return: void
    */
    handleEnemy(enemy){
        // Separate into two things
        let myX = this.getX();
        let myY = this.getY();
        let enemyX = enemy.getX();
        let enemyY = enemy.getY();
        let enemyXDisplacement = enemyX - myX;
        let enemyYDisplacement = enemyY - myY;
        let distanceToEnemy = this.distance(enemy);

        // To prevent issues in calculating angles, if the enemy is ontop of you no need to move
        if (distanceToEnemy < 1){
            return;
        }
        // Otherwise enemy is not too much "on top" of the bot
        let shootingAngle = this.getNoseAngle();
        let angleDEG = displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
        let angleDifference = calculateAngleDiffDEG(shootingAngle, angleDEG);

        // Give information to handleMovement and let it decide how to move
        this.handleMovement(angleDEG, distanceToEnemy, enemy);
    }

    /*
        Method Name: handleMovement
        Method Parameters:
            anlgeDEG:
                An angle from the current location to that of the enemy
            distance:
                The current distance from the current location to the enemy
            enemy:
                An enemy fighter plane
        Method Description: Decide how to move given the presence of an enemy.
        Method Return: void
    */
    handleMovement(angleDEG, distance, enemy){
        // If facing downwards and close to the ground then turn upwards
        if (this.closeToGround() && angleBetweenCCWDEG(this.getNoseAngle(), 180, 359)){
            this.turnInDirection(90);
            return;
        }

        // Point to enemy when very far away
        if (distance > this.speed * FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] * FILE_DATA["constants"]["TURN_TO_ENEMY_CONSTANT"]){
            this.turnInDirection(angleDEG);
            return;
        }
    }

    /*
        Method Name: closeToGround
        Method Parameters: None
        Method Description: Determine if the plane is close to the ground
        Method Return: True if close to the ground, false if not close
    */
    closeToGround(){
        return this.y < FILE_DATA["constants"]["CLOSE_TO_GROUND_CONSTANT"] * this.speed;
    }

    /*
        Method Name: turnInDirection
        Method Parameters:
            angleDEG:
                The angle to turn to (degrees)
        Method Description: Turn the plane in a given direction
        Method Return: void
    */
    turnInDirection(angleDEG){
        // Determine if we need to switch from left to right
        let myAngle = this.getNoseAngle();
        // If facing right and the angle to turn to is very far but close if the plane turned left
        if (this.facingRight && angleBetweenCCWDEG(angleDEG, 135, 225) && angleBetweenCCWDEG(myAngle, 315, 45)){
            this.face(false);
            return;
        }
        // If facing left and the angle to turn to is very far but close if the plane turned right
        else if (!this.facingRight && angleBetweenCCWDEG(angleDEG, 295, 45) && angleBetweenCCWDEG(angleDEG, 135, 225)){
            this.face(true);
            return;
        }

        if (this.udLock.notReady()){ return; }
        this.udLock.lock();
        let newAngleCW = fixDegrees(this.getNoseAngle() + 1);
        let newAngleCCW = fixDegrees(this.getNoseAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);

        // If the angle of the plane currently is very close to the desired angle, not worth moving
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < FILE_DATA["constants"]["MIN_ANGLE_TO_ADJUST"] && calculateAngleDiffDEG(newAngleCCW, angleDEG) < FILE_DATA["constants"]["MIN_ANGLE_TO_ADJUST"]){
            return;
        }
        // The clockwise distance is less than the counter clockwise difference and facing right then turn clockwise 
        if (dCW < dCCW && this.facingRight){
            this.adjustAngle(-1);
        }
        // The clockwise distance is less than the counter clockwise difference and facing left then turn counter clockwise 
        else if (dCW < dCCW && !this.facingRight){
            this.adjustAngle(1);
        }
        // The counter clockwise distance is less than the clockwise difference and facing right then turn counter clockwise 
        else if (dCCW < dCW && this.facingRight){
            this.adjustAngle(1);
        }
        // The counter clockwise distance is less than the clockwise difference and facing left then turn clockwise 
        else if (dCCW < dCW && !this.facingRight){
            this.adjustAngle(-1);
        }
        // Otherwise just turn clockwise (Shouldn't actually be possible?)
        else{
            this.adjustAngle(1);
        }
    }

    /*
        Method Name: getEnemyList
        Method Parameters: None
        Method Description: Find all the enemies and return them
        Method Return: List
    */
    getEnemyList(){
        let entities = this.scene.getPlanes();
        let enemies = [];
        for (let entity of entities){
            if (entity instanceof Plane && !this.onSameTeam(entity) && entity.isAlive()){
                enemies.push(entity);
            }
        }
        let me = this;
        return enemies.sort((enemy1, enemy2) => {
            let d1 = enemy1.distance(me);
            let d2 = enemy2.distance(me);
            if (d1 < d2){
                return -1;
            }else if (d1 > d2){
                return 1;
            }else{
                return 0;
            }
        });
    }

    /*
        Method Name: hasCurrentEnemy
        Method Parameters: None
        Method Description: Determine if there is currently a current enemy
        Method Return: True if has an enemy (and they exist), otherwise false
    */
    hasCurrentEnemy(){
        return this.currentEnemy != null && this.currentEnemy.isAlive();
    }

    /*
        Method Name: getCurrentEnemy
        Method Parameters: None
        Method Description: Get the current enemy
        Method Return: Plane
    */
    getCurrentEnemy(){
        return this.currentEnemy;
    }
}