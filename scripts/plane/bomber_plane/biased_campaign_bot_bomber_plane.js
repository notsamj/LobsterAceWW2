/*
    Class Name: BiasedCampaignBotBomberPlane
    Description: A subclass of the BomberPlane with biases for its actions and the task at bombing all buildings.
    Note: Lots of this code should be copied from BiasedBotBomberPlane. It's unfortunate but this can't be a subclass so its mostly a copy.
    TODO: Class needs comments
*/
class BiasedCampaignBotBomberPlane extends BomberPlane {
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
        this.bombLock = new TickLock(750 / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.facingLock = new TickLock(1000 / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.udLock = new TickLock(40 / FILE_DATA["constants"]["MS_BETWEEN_TICKS"]);
        this.biases = biases;
        this.generateGuns(biases);
        this.throttle += this.biases["throttle"];
        this.maxSpeed += this.biases["max_speed"];
        this.health += this.biases["health"];
        this.startingHealth = this.health;
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
        this.facingLock.tick();
        this.bombLock.tick();
        for (let gun of this.guns){
            gun.tick();
        }

        // Make decisions

        // Decide if the plane must switch directions
        this.decideOnDirection();

        // Decide of whether or not to bomb
        this.checkIfBombing();

        // Check to shoot guns
        this.checkGuns();

        // Bomber Plane Tick Call
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
        Method Name: getEnemyList
        Method Parameters: None
        Method Description: Find all the enemies and return them
        Method Return: List
    */
    getEnemyList(){
        let entities = this.scene.getPlanes();
        let enemies = [];
        for (let entity of entities){
            if (entity instanceof Plane && !this.onSameTeam(entity)){
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
        Method Name: getMaxShootingDistance
        Method Parameters: None
        Method Description: Return the max shooting distance of this biased plane
        Method Return: float
    */
    getMaxShootingDistance(){
        return FILE_DATA["constants"]["SHOOT_DISTANCE_CONSTANT"] * FILE_DATA["bullet_data"]["speed"] + this.biases["max_shooting_distance_offset"];
    }

    decideOnDirection(){
        if (this.facingLock.notReady()){ return; }
        let buildingInfo = this.getBuildingInfo();
        // If far past the last building then turn around
        if (this.x > buildingInfo["last_building"] + this.bombXAirTravel() * FILE_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"] && this.isFacingRight()){
            this.face(false);
        }
        // If far ahead of the first building and facing the wrong way then turn around
        else if (this.x < buildingInfo["first_building"] - this.bombXAirTravel() * FILE_DATA["ai"]["bomber_plane"]["bomb_falling_distance_allowance_multiplier"] && !this.isFacingRight()){
            this.face(true);
        }else{
            return;
        }
        this.facingLock.lock();
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
        return new BiasedCampaignBotBomberPlane(planeClass, scene, true, 0, biases); // Temporary values some will be changed
    }

    getBuildingInfo(){
        let frontEnd = null;
        let backEnd = null;
        for (let building of activeGameMode.getBuildings()){
            if (frontEnd == null || building.getX() < frontEnd){
                frontEnd = building.getX();
            }
            if (backEnd == null || building.getX() + building.getWidth() > backEnd){
                backEnd = building.getX() + building.getWidth();
            }
        }
        return {"first_building": frontEnd, "last_building": backEnd};
    }

    bombXAirTravel(){
        // If the plane is at/below ground don't bother with computation
        if (this.y <= 0){ return 0; }
        // Calculate time to hit ground
        /*
            d = vI * t + 1/2 * g * t^2
            d = 0.5g * t^2 + vI * t + 0
            0 = 0.5g * t^2 + vI * t - d
            t = [-1 * vI + sqrt(vI + 2 * g * d)] / g
        */
        let vI = this.bombInitialYVelocityMagnitude();
        let g = FILE_DATA["constants"]["GRAVITY"];
        let d = this.y;
        let time = (-1 * vI + Math.sqrt(Math.pow(vI, 2) + 2 * d * g)) / g;
        // Calculate x distance covered in that time
        return Math.abs(this.getXVelocity() * time);
    }

    bombInitialYVelocityMagnitude(){
        return Math.abs(this.getYVelocity()) + Math.abs(FILE_DATA["bomb_data"]["initial_y_velocity"]); 
    }

    // Check if its worth bombing and drop bombs
    checkIfBombing(){
        if (this.bombLock.notReady()){ return; }
        let distanceTravelledByBomb = this.bombXAirTravel();
        let bombHitX = this.x + distanceTravelledByBomb * (this.isFacingRight() ? 1 : -1);
        let buildingInfo = this.getBuildingInfo();
        // If the bomb hit location isn't near the buildings then don't drop a bomb
        if (!(bombHitX >= buildingInfo["first_building"] && bombHitX <= buildingInfo["last_building"])){ return; }
        this.bombLock.lock();
        this.dropBomb();
    }
}