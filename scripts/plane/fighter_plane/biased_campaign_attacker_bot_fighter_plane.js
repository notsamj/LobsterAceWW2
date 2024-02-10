// TODO: Comments
class BiasedCampaignAttackerBotFighterPlane extends BiasedBotFighterPlane {
/*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            scene:
                A Scene object related to the fighter plane
            biases:
                An object containing keys and bias values
            angle:
                The starting angle of the fighter plane (integer)
            facingRight:
                The starting orientation of the fighter plane (boolean)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, scene, biases, angle=0, facingRight=true){
        super(planeClass, scene, biases, angle, facingRight);
        this.startingThrottle = this.throttle;
    }

    tick(timeMS){
        super.tick(timeMS);
        // Always make sure throttle is at max if fighting 
        if (this.currentEnemy != null){
            this.adjustThrottle(1);
        }
    }

    /*
        Method Name: adjustThrottle
        Method Parameters:
            amt:
                Amount by which the throttle is changed (can be pos/neg)
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    adjustThrottle(amt){
        this.throttle = Math.min(Math.max(1, this.throttle + amt), this.startingThrottle);
    }

    // TODO: Comments
    handleWhenNoEnemy(){
        this.cruiseByBomber();
    }

    findMyBomber(){
        let furthestBomber = null;
        let planes = this.scene.getPlanes();
        for (let plane of planes){
            if (!(plane instanceof BomberPlane) || plane.isDead()){ continue; }
            if (furthestBomber == null || plane.getX() > furthestBomber.getX()){
                furthestBomber = plane;
            }
        }
        // Bomber assumed not null because then game is broken
        return furthestBomber;
    }

    cruiseByBomber(){
        let bomber = this.findMyBomber();
        // Incase bomber just died
        if (bomber == null){ return; }
        let xDistance = Math.abs(bomber.getX() - this.getX());
        let yDistance = Math.abs(bomber.getY() - this.getY());
        // If too far from bomber in x then go to bomber
        if (xDistance > FILE_DATA["ai"]["fighter_plane"]["max_x_distance_from_bomber_cruising_campaign"] || yDistance > FILE_DATA["ai"]["fighter_plane"]["max_y_distance_from_bomber_cruising_campaign"]){
            // Make sure that you are facing the right way
            if (bomber.isFacingRight() != this.isFacingRight()){
                this.face(!this.isFacingRight());
            }
            let angleToBomberDEG = this.angleToOtherDEG(bomber);
            let dCW = calculateAngleDiffDEGCW(this.angle, angleToBomberDEG);
            let dCCW = calculateAngleDiffDEGCCW(this.angle, angleToBomberDEG);
            if (dCW < dCCW){
                this.adjustAngle(-1);
            }else if (dCCW < dCW){
                this.adjustAngle(1);
            }
            // Make sure you're at top speed heading to the bomber!
            this.adjustThrottle(1);
            return;
        }
        // Else close to the bomber
        // Face in the proper direction
        if (bomber.isFacingRight() != this.isFacingRight()){
            this.face(!this.isFacingRight());
        }
        // Adjust angle to match bomber's angle
        let dCW = calculateAngleDiffDEGCW(this.angle, bomber.getAngle());
        let dCCW = calculateAngleDiffDEGCCW(this.angle, bomber.getAngle());
        if (dCW < dCCW){
            this.adjustAngle(-1);
        }else if (dCCW < dCW){
            this.adjustAngle(1);
        }
        // Speed up or slow down depending on bomber's speed
        if (this.getSpeed() > bomber.getSpeed()){
            this.adjustThrottle(-1);
        }else{
            this.adjustThrottle(1);
        }
    }

    /*
        Method Name: updateEnemy
        Method Parameters: None
        Method Description: Determine the id of the current enemy
        Method Return: void
    */
    updateEnemy(){
        // If we have an enemy already and its close then don't update
        if (this.currentEnemy != null && this.currentEnemy.isAlive() && this.distance(this.currentEnemy) <= (FILE_DATA["constants"]["ENEMY_DISREGARD_DISTANCE_TIME_CONSTANT"] + this.biases["enemy_disregard_distance_time_constant"]) * this.speed){
            return;
        }
        let enemies = this.getEnemyList();
        let bestRecord = null;

        // Loop through all enemies and determine a score for being good to attack
        
        for (let enemy of enemies){
            let distance = this.distance(enemy);
            if (distance > FILE_DATA["ai"]["fighter_plane"]["max_enemy_distance_campaign"]){ continue; }
            let score = calculateEnemyScore(distance, BiasedBotFighterPlane.focusedCount(this.scene, enemy.getID(), this.getID()) * this.biases["enemy_taken_distance_multiplier"]);
            if (bestRecord == null || score < bestRecord["score"]){
                bestRecord = {
                    "enemy": enemy,
                    "score": score
                }
            }
        }
        
        // If none found then do nothing
        if (bestRecord == null){ return; }
        this.currentEnemy = bestRecord["enemy"];
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
        Method Description: Return a new biased campaign attacker plane
        Method Return: BiasedCampaignAttackerBotFighterPlane
    */
    static createBiasedPlane(planeClass, scene, difficulty){
        let biases = BiasedBotFighterPlane.createBiases(difficulty);
        return new BiasedCampaignAttackerBotFighterPlane(planeClass, scene, biases);
    }
}