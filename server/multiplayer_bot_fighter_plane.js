const BiasedBotFighterPlane = require("../scripts/biased_bot_fighter_plane.js");
const HF = require("../scripts/helper_functions.js");
const fileData = require("../data/data_json.js");
class MultiplayerBiasedBotFighterPlane extends BiasedBotFighterPlane {
    constructor(planeClass, scene, biases, x, y, angle=0, facingRight=true){
        super(planeClass, scene, biases, angle, facingRight);
        this.x = x;
        this.y = y;
        this.lastActions = {
            "face": facingRight,
            "turn": 0,
            "shooting": false,
            "throttle": 0
        }
    }

    getLastActions(){
        return this.lastActions;
    }

    action(actionPair){
        let key = actionPair["action"];
        let value = actionPair["value"];
        if (this.lastActions[key] != value){ // NOTE: Not sure if this makes sense
            this.lastActions[key] = value;
        }
    }

    tick(timeDiffMS){
        this.action({"action": "turn", "value": 0}); // Just set a default... TODO: Maybe improve this?
        this.action({"action": "shooting", "value": false}); // Init to flase 
        super.tick(timeDiffMS);
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
            this.action({"action": "shooting", "value": true});
            return;
        }
        // Otherwise enemy is not too much "on top" of the bot
        let shootingAngle = this.getShootingAngle();
        let angleDEG = HF.displacementToDegrees(enemyXDisplacement, enemyYDisplacement);
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

    turnInDirection(angleDEG){
        // Determine if we need to switch from left to right
        let myAngle = this.getShootingAngle();
        if (this.facingRight && angleBetweenCWDEG(angleDEG, 135 + this.biases["flip_direction_lb"], 225 + this.biases["flip_direction_ub"]) && angleBetweenCWDEG(myAngle, 315 + this.biases["flip_direction_lb"], 45 + this.biases["flip_direction_ub"])){
            this.face(false);
            this.action({"action": "face", "value": false});
            return;
        }else if (!this.facingRight && angleBetweenCWDEG(angleDEG, 295 + this.biases["flip_direction_lb"], 45 + this.biases["flip_direction_ub"]) && angleBetweenCWDEG(angleDEG, 135 + this.biases["flip_direction_lb"], 225 + this.biases["flip_direction_ub"])){
            this.face(true);
            this.action({"action": "face", "value": true});
            return;
        }
        myAngle = this.getShootingAngle();
        let newAngleCW = fixDegrees(this.getShootingAngle() + 1);
        let newAngleCCW = fixDegrees(this.getShootingAngle() - 1);
        let dCW = calculateAngleDiffDEGCW(newAngleCW, angleDEG);
        let dCCW = calculateAngleDiffDEGCCW(newAngleCCW, angleDEG);
        if (calculateAngleDiffDEG(newAngleCW, angleDEG) < fileData["constants"]["MIN_ANGLE_TO_ADJUST"] + this.biases["min_angle_to_adjust"] && calculateAngleDiffDEG(newAngleCCW, angleDEG) < fileData["constants"]["MIN_ANGLE_TO_ADJUST"] + this.biases["min_angle_to_adjust"]){
            this.action({"action": "turn", "value": 0});
            return;
        }
        if (dCW < dCCW && this.facingRight){
            this.adjustAngle(1);
            this.action({"action": "turn", "value": 1});
        }else if (dCW < dCCW && !this.facingRight){
            this.adjustAngle(-1);
            this.action({"action": "turn", "value": -1});
        }else if (dCCW < dCW && this.facingRight){
            this.adjustAngle(-1);
            this.action({"action": "turn", "value": -1});
        }else if (dCCW < dCW && !this.facingRight){
            this.adjustAngle(1);
            this.action({"action": "turn", "value": 1});
        }else{
            this.adjustAngle(1);
            this.action({"action": "turn", "value": 1});
        }
        //console.log(this.planeClass, newAngleCW, newAngleCCW, angleDEG, dCW, dCCW, consoleLog1)

    }

    tryToShootAtEnemy(angleDifference, enemyRadius, distanceToEnemy){
        let angleAllowanceAtRangeDEG = toDegrees(Math.abs(Math.atan(enemyRadius / distanceToEnemy)));
        let hasClearShot = angleDifference < angleAllowanceAtRangeDEG + this.biases["angle_allowance_at_range"] && distanceToEnemy < this.getMaxShootingDistance();
        this.action({"action": "shooting", "value": hasClearShot});
        if (this.shootLock.isReady() && hasClearShot){
            this.shootLock.lock();
            this.shoot();
            return true;
        }
        return false;
    }

    static createBiasedPlane(planeClass, scene, fileData){
        let biases = {};
        let allyX = fileData["dogfight_settings"]["ally_spawn_x"];
        let allyY = fileData["dogfight_settings"]["ally_spawn_y"];
        let axisX = fileData["dogfight_settings"]["axis_spawn_x"];
        let axisY = fileData["dogfight_settings"]["axis_spawn_y"];
        let allyFacingRight = allyX < axisX;
        let facingRight = (HF.planeModelToAlliance(planeClass) == "Allies") ? allyFacingRight : !allyFacingRight;
        let x = (HF.planeModelToAlliance(planeClass) == "Allies") ? allyX : axisX; 
        let y = (HF.planeModelToAlliance(planeClass) == "Allies") ? allyY : axisY;
        let aX = x + HF.randomFloatBetween(-1 * fileData["dogfight_settings"]["spawn_offset"], fileData["dogfight_settings"]["spawn_offset"]);
        let aY = y + HF.randomFloatBetween(-1 * fileData["dogfight_settings"]["spawn_offset"], fileData["dogfight_settings"]["spawn_offset"]);
        for (let [key, bounds] of Object.entries(fileData["ai"]["bias_ranges"])){
            let upperBound = bounds["upper_bound"];
            let lowerBound = bounds["lower_bound"];
            let usesFloatValue = Math.floor(upperBound) != upperBound || Math.floor(lowerBound) != lowerBound;
            biases[key] = usesFloatValue ? HF.randomFloatBetween(lowerBound, upperBound) : HF.randomNumberInclusive(lowerBound, upperBound);    
        }
        let newPlane = new MultiplayerBiasedBotFighterPlane(planeClass, scene, biases, aX, aY, 0, facingRight);
        return newPlane;
    }

    getState(){
        // console.log("Speed", this.speed)
        return {
            "plane_class": this.getPlaneClass(),
            "id": this.getID(),
            "isDead": this.isDead(),
            "x": this.getX(),
            "y": this.getY(),
            "facing": this.isFacingRight(),
            "angle": this.angle,
            "throttle": this.throttle,
            "speed": this.speed,
            "max_speed": this.maxSpeed,
            "throttle_constant": this.throttleConstant,
            "health": this.health,
            "rotation_time": this.biases["rotation_time"], // Is a bias but also humans have it
            "biases": this.biases,
            "lastActions": this.lastActions
        }
    }

    update(archivedStats){
        this.x = archivedStats["x"];
        this.y = archivedStats["y"];
        this.facingRight = archivedStats["facing"];
        this.angle = archivedStats["angle"];
        this.speed = archivedStats["speed"];
        this.throttle = archivedStats["throttle"];
        this.health = archivedStats["health"];
        this.lastActions = archivedStats["lastActions"];
    }
}
if (typeof window === "undefined"){
    module.exports = MultiplayerBiasedBotFighterPlane;
}