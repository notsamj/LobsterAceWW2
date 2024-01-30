/*
    Class Name: BotBomberPlane
    Description: An abstract subclass of the BomberPlane that determines actions without human input
*/
class BotBomberPlane extends BomberPlane {
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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, angle=0, facingRight=true){
        super(planeClass, scene, angle, facingRight);
    }

    /*
        Method Name: generateGuns
        Method Parameters: None
        Method Description: Create gun objects for the plane
        Method Return: void
    */
    generateGuns(){
        this.guns = [];
        for (let gunObj of FILE_DATA["plane_data"][this.planeClass]["guns"]){
            this.guns.push(BotBomerTurret.create(gunObj, this.scene, this));
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
        super.tick(timeDiffMS);
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
            return;
        }
        // Otherwise we are just looking for enemies

        // Check if the selected enemy should be changed
        this.updateEnemy();
        // If there is an enemy then act accordingly
        if (this.hasCurrentEnemy()){
            let enemy = this.scene.getEntity(this.currentEnemyID);
            this.handleEnemy(enemy);
            this.checkGuns();
        }else{ // No enemy -> make sure not to crash into the ground
            if (this.closeToGround() && angleBetweenCCWDEG(this.getNoseAngle(), 180, 359)){
                this.turnInDirection(90);
                this.checkGuns();
                return;
            }
        }
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
        return {"empty": false, "centerX": totalX/fC, "centerY": totalY/fC};
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
            if (entity instanceof Plane && this.onSameTeam(entity)){
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
             if (this.lrCDLock.notReady()){ return; }
            this.lrCDLock.lock();
            this.face(false);
            return;
        }
        // If facing left and the angle to turn to is very far but close if the plane turned right
        else if (!this.facingRight && angleBetweenCCWDEG(angleDEG, 295, 45) && angleBetweenCCWDEG(angleDEG, 135, 225)){
            if (this.lrCDLock.notReady()){ return; }
            this.lrCDLock.lock();
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
        // TODO: Sort by distance (close -> far)
        let entities = this.scene.getPlanes();
        let enemies = [];
        for (let entity of entities){
            if (entity instanceof Plane && !this.onSameTeam(entity)){
                enemies.push(entity);
            }
        }
        return enemies;
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemyID != null && this.scene.hasEntity(this.currentEnemyID) && this.distance(this.scene.getEntity(this.currentEnemyID)) <= FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;
        // Loop through all enemies and determine a score for being good to attack
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            let focusedCountMultiplier = (BotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID())) * FILE_DATA["constants"]["ENEMY_DISTANCE_SCORE_MULTIPLIER_BASE"];
            let score = distance;
            // Do not modify score if its less than 1 because the bias is meant for having many enemies
            if (focusedCountMultiplier > 1){
                score *= focusedCountMultiplier;
            }
            // If this new enemy is better
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "id": enemy.getID(),
                    "score": score
                }
            }
        }
        if (bestRecord == null){ return; }
        this.currentEnemyID = bestRecord["id"];
    }

    /*
        Method Name: hasCurrentEnemy
        Method Parameters: None
        Method Description: Determine if there is currently a current enemy
        Method Return: True if has an enemy (and they exist), otherwise false
    */
    hasCurrentEnemy(){
        return this.currentEnemyID != null && this.scene.hasEntity(this.currentEnemyID);
    }

    /*
        Method Name: getCurrentEnemy
        Method Parameters: None
        Method Description: Get the id of the current enemy
        Method Return: A string of the id of the current enemy
    */
    getCurrentEnemy(){
        return this.currentEnemyID;
    }

    /*
        Method Name: onSameTeam
        Method Parameters: otherPlane
        Method Description: Determine if this plane is on the same team as another plane
        Method Return: True if the planes are on the same team, false otherwise
    */
    onSameTeam(otherPlane){
        return onSameTeam(this.getPlaneClass(), otherPlane.getPlaneClass());
    }

    /*
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return FILE_DATA["constants"]["SHOOT_DISTANCE_CONSTANT"] * FILE_DATA["bullet_data"]["speed"];
    }
}

// If using Node JS Export the class
if (typeof window === "undefined"){
    module.exports = BotBomberPlane;
}