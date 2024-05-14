// If using NodeJS -> Do required imports
if (typeof window === "undefined"){
    TickLock = require("../../general/tick_lock.js");
    Bullet = require("../../other_entities/simple_projectiles/bullet.js");
    Plane = require("../plane.js");
    helperFunctions = require("../../general/helper_functions.js");
    toRadians = helperFunctions.toRadians;
    GunHeatManager = require("../../misc/gun_heat_manager.js");
}
/*
    Class Name: FighterPlane
    Description: Abstract class representing a FighterPlane
*/
class FighterPlane extends Plane {
    /*
        Method Name: constructor
        Method Parameters:
            planeClass:
                A string representing the type of plane
            gamemode:
                A gamemode object related to the fighter plane
            autonomous:
                Whether or not the plane may control itself
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(planeClass, gamemode, autonomous){
        super(planeClass, gamemode, autonomous);
        this.gunHeatManager = new GunHeatManager(PROGRAM_DATA["plane_data"][planeClass]["bullet_heat_capacity"], PROGRAM_DATA["plane_data"][planeClass]["cooling_time_ms"])
        this.shootLock = new TickLock(PROGRAM_DATA["plane_data"][planeClass]["rate_of_fire"] * PROGRAM_DATA["settings"]["bullet_reduction_coefficient"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.prop = new Propeller(this, PROGRAM_DATA["plane_data"][planeClass]["propeller"]);
    }

    /*
        Method Name: getDamage
        Method Parameters: None
        Method Description: Determines how much damage a bullet from this plane causes
        Method Return: Number
    */
    getDamage(){
        return PROGRAM_DATA["plane_data"][this.getPlaneClass()]["bullet_damage"];
    }

    /*
        Method Name: getShootLock
        Method Parameters: None
        Method Description: Getter
        Method Return: TickLock
    */
    getShootLock(){
        return this.shootLock;
    }

    /*
        Method Name: getGunHeatManager
        Method Parameters: None
        Method Description: Getter
        Method Return: GunHeatManager
    */
    getGunHeatManager(){
        return this.gunHeatManager;
    }

    /*
        Method Name: loadImportantData
        Method Parameters:
            rep:
                A Json representation of the plane sent by the server
        Method Description: Loads important data received from the server
        Method Return: void
    */
    loadImportantData(rep){
        // This is always local being received from the server
        this.health = rep["basic"]["health"];
        this.dead = rep["basic"]["dead"];
        this.shootLock.setTicksLeft(rep["locks"]["shoot_lock"]);
    }

    /*
        Method Name: loadDecisions
        Method Parameters:
            rep:
                A Json representation of the plane sent by the server
        Method Description: Loads important decisions received from the server
        Method Return: void
    */
    loadDecisions(rep){
        this.decisions["shoot"] = rep["decisions"]["shoot"];
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Conduct decisions to do each tick
        Method Return: void
    */
    tick(){
        this.shootLock.tick();
        this.gunHeatManager.tick();
        super.tick();
    }

    /*
        Method Name: resetDecisions
        Method Parameters: None
        Method Description: Resets the decisions so the planes actions can be chosen to reflect what it current wants to do rather than previously
        Method Return: void
    */
    resetDecisions(){
        this.decisions["face"] = 0;
        this.decisions["angle"] = 0;
        this.decisions["shoot"] = false;
        this.decisions["throttle"] = 0;
    }

    /*
        Method Name: areMovementDecisionsChanged
        Method Parameters:
            decisions1:
                A decisions object
            decisions2:
                A decisions object
        Method Description: Determines if the two decisions objects have different decisions
        Method Return: Boolean
    */
    static areMovementDecisionsChanged(decisions1, decisions2){
        let c1 = decisions1["face"] != decisions2["face"];
        if (c1){ return true; }
        let c2 = decisions1["angle"] != decisions2["angle"];
        if (c2){ return true; }
        let c3 = decisions1["throttle"] != decisions2["throttle"];
        return c3;
    }

    /*
        Method Name: executeMainDecisions
        Method Parameters: None
        Method Description: Take actions based on saved decisions
        Method Return: void
    */
    executeMainDecisions(){
        // Change facing direction
        if (this.decisions["face"] != 0){
            this.face(this.decisions["face"] == 1 ? true : false);
        }

        // Adjust angle
        if (this.decisions["angle"] != 0){
            this.adjustAngle(this.decisions["angle"]);
        }

        // Adjust throttle
        if (this.decisions["throttle"] != 0){
            this.adjustThrottle(this.decisions["throttle"]);
        }
    }
    
    /*
        Method Name: executeAttackingDecisions
        Method Parameters: None
        Method Description: Decide whether or not to shoot
        Method Return: void
    */
    executeAttackingDecisions(){
        // Check shooting
        if (this.decisions["shoot"]){
            if (this.shootLock.isReady() && this.gunHeatManager.canShoot() && this.gamemode.runsLocally()){
                this.shootLock.lock();
                this.gunHeatManager.shoot();
                this.shoot();
            }
        }
    }

    /*
        Method Name: shoot
        Method Parameters: None
        Method Description: Shoots a bullet from the plane
        Method Return: void
    */
    shoot(){
        this.gamemode.getSoundManager().play("shoot", this.getX(), this.getY());
        // If using physical bullets then do it this way
        if (this.gamemode.areBulletPhysicsEnabled()){
            this.gamemode.getTeamCombatManager().addBullet(new Bullet(this.getGunX(), this.getGunY(), this.gamemode, this.getXVelocity(), this.getYVelocity(), this.getNoseAngle(), this.getID(), this.getPlaneClass(), this.getDamage()));
        }else{ // Fake bullets
            this.instantShot(this.getGunX(), this.getGunY(), this.getNoseAngle());
        }
    }

    /*
        Method Name: getGunX
        Method Parameters: None
        Method Description: Calculates the location of the gun on the x axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getGunX(){
        let planeAngleRAD = this.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180));
        }
        let rotatedX = Math.cos(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getX();
        return rotatedX;
    }

    /*
        Method Name: getGunY
        Method Parameters: None
        Method Description: Calculates the location of the gun on the y axis. Takes into account the angle of the attached plane and its offset.
        Method Return: float
    */
    getGunY(){
        let planeAngleRAD = this.getNoseAngle();
        if (!this.isFacingRight()){
            planeAngleRAD = fixRadians(planeAngleRAD - toRadians(180));
        }
        let rotatedY = Math.sin(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getY();
        return rotatedY;
    }

    /*
        Method Name: getInterpolatedGunX
        Method Parameters: None
        Method Description: Determine the x location of a gun, interpolated between ticks
        Method Return: Number
    */
    getInterpolatedGunX(){
        let planeAngleRAD = this.getInterpolatedAngle();
        let rotatedX = Math.cos(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) - Math.sin(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getInterpolatedX();
        return rotatedX;
    }

    /*
        Method Name: getInterpolatedGunY
        Method Parameters: None
        Method Description: Determine the y location of a gun, interpolated between ticks
        Method Return: Number
    */
    getInterpolatedGunY(){
        let planeAngleRAD = this.getInterpolatedAngle();
        let rotatedY = Math.sin(planeAngleRAD) * (PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_x"] * (this.isFacingRight() ? 1 : -1)) + Math.cos(planeAngleRAD) * PROGRAM_DATA["plane_data"][this.getPlaneClass()]["gun_offset_y"] + this.getInterpolatedY();
        return rotatedY;
    }

    /*
        Method Name: display
        Method Parameters:
            lX:
                The bottom left x displayed on the canvas relative to the focused entity
            bY:
                The bottom left y displayed on the canvas relative to the focused entity
            displayTime:
                The time used to interpolate the positions of the planes
        Method Description: Displays a plane on the screen (if it is within the bounds)
        Method Return: void
    */
    display(lX, bY, displayTime){
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;

        this.calculateInterpolatedCoordinates(displayTime);
        // If not on screen then return
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        // Super call to remove (some) code repetition
        super.display(lX, bY, displayTime);

        // If dead don't display gun flash
        if (this.isDead()){
            return;
        }

        // Display Prop
        this.prop.display(lX, bY, displayTime);

        // If you've previously shot then display a flash to indicate
        if (this.shootLock.notReady()){
            // Display flash
            let displayX = this.gamemode.getScene().getDisplayX(this.getInterpolatedGunX(), 0, lX);
            let displayY = this.gamemode.getScene().getDisplayY(this.getInterpolatedGunY(), 0, bY);
            let rotateX = displayX;
            let rotateY = displayY;
            let interpolatedAngle = this.getInterpolatedAngle();
            let image = getImage("flash");
            let flashImageWidth = image.width;
            let flashImageHeight = image.height;

            // Prepare the display
            translate(rotateX, rotateY);
            rotate(-1 * interpolatedAngle);

            // If facing left then turn around the display
            if (!this.isFacingRight()){
                scale(-1, 1);
            }

            // Game scale
            scale(gameZoom, gameZoom);

            // Display flash
            displayImage(image, 0 - flashImageWidth / 2,  0 - flashImageHeight / 2);

            // Undo game zoom scale
            scale(1/gameZoom, 1/gameZoom);

            // If facing left then turn around the display (reset)
            if (!this.isFacingRight()){
                scale(-1, 1);
            }
            // Reset the rotation and translation
            rotate(interpolatedAngle);
            translate(-1 * rotateX, -1 * rotateY);
        }
    }
    /*
        Method Name: displayHUD
        Method Parameters:
            displayTime:
                The current time in miliseconds
        Method Description: Display the HUD of the fighter plane
        Method Return: void
    */
    displayHUD(displayTime){
        this.gunHeatManager.display(displayTime - this.gamemode.getLastTickTime());
    }

}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = FighterPlane;
}