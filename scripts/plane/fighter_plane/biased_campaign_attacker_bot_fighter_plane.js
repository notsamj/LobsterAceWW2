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
        super(planeClass, scene, angle, facingRight);
    }

    // TODO: Comments
    handleWhenNoEnemy(){
        this.cruiseByBomber();
    }

    findMyBomber(){
        let furthestBomber = null;
        for (let plane of this.scene.getPlanes()){
            if (!(plane instanceof Bomber)){ continue; }
            if (furthestBomber == null || plane.getX() > furthestBomber.getX()){
                furthestBomber = plane;
            }
        }
        // Bomber assumed not null because then game is broken
        return furthestBomber;
    }

    cruiseByBomber(){
        let bomber = this.findMyBomber();
        let xDistance = Math.abs(bomber.getX() - this.getX());
        let yDistance = Math.abs(bomber.getY() - this.getY());
        // If too far from bomber in x then go to bomber
        if (xDistance > FILE_DATA["ai"]["fighter_plane"]["max_x_distance_from_bomber_cruising_campaign"] || yDistance > FILE_DATA["ai"]["fighter_plane"]["max_y_distance_from_bomber_cruising_campaign"]){
            // Make sure that you are facing the right way
            if (bomber.isFacingRight() != this.isFacingRight()){
                this.face(!this.isFacingRight());
            }
            let angleToBomberDEG = this.angleToOtherDEG(bomber);
            let dCW = calculateAngleDiffDEGCW(this.angle, angleDEG);
            let dCCW = calculateAngleDiffDEGCCW(this.angle, angleDEG);
            if (dCW < dCCW){
                this.adjustAngle(-1);
            }else if (dCCW < dCW){
                this.adjustAngle(1);
            }
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
            if (distance < FILE_DATA["ai"]["fighter_plane"]["min_enemy_distance_campaign"]){ continue; }
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
}