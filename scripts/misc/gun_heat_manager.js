/*
    Class Name: GunHeatManager
    Description: Manages the heat of a gun and whether or not it can shoot
*/
class GunHeatManager {
    /*
        Method Name: constructor
        Method Parameters:
            bulletHeatCapacity:
                The number of bullets it takes to reach heat capacity with no cooling
            coolingTimeMS:
                The time it takes the gun to go from full heat to zero
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(bulletHeatCapacity, coolingTimeMS){
        this.bulletHeatCapacity = bulletHeatCapacity;
        this.maxCoolingDelayTicks = Math.ceil(PROGRAM_DATA["heat_bar"]["cooling_delay_ms"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.coolingDelayTicks = 0;
        this.coolingTimeMS = coolingTimeMS;
        this.heat = 0;
        this.emergencyCooling = false;
        this.activelyShooting = false;
    }

    /*
        Method Name: reset
        Method Parameters: None
        Method Description: Resets the gunheat manager
        Method Return: void
    */
    reset(){
        this.activelyShooting = false;
        this.emergencyCooling = false;
        this.heat = 0;
        this.coolingDelayTicks = 0;
    }

    /*
        Method Name: getThreshold
        Method Parameters: None
        Method Description: Determines which threshold is met by the current heat
        Method Return: String
    */
    getThreshold(){
        let heatPercentage = this.heat/this.bulletHeatCapacity;
        if (heatPercentage > PROGRAM_DATA["heat_bar"]["threshold_3"]){
            return "threshold_3";
        }else if (heatPercentage > PROGRAM_DATA["heat_bar"]["threshold_2"]){
            return "threshold_2";
        }else{
            return "threshold_1";
        }
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Handles the cooling that takes place
        Method Return: void
    */
    tick(){
        // If on cooling delay
        if (this.coolingDelayTicks > 0){
            this.coolingDelayTicks--;
            return;
        }
        // Nothing to do if already at minimum heat
        if (this.heat == 0){ return; }

        // Reduce heat if not actively shooting
        if (!this.isActivelyShooting()){
            this.heat = Math.max(0, this.heat - this.bulletHeatCapacity *  PROGRAM_DATA["settings"]["ms_between_ticks"] / this.coolingTimeMS);
            // Determine whether to cancel cooling
            if (this.isCooling() && this.heat / this.bulletHeatCapacity < PROGRAM_DATA["heat_bar"]["threshold_3"]){
                this.emergencyCooling = false;
            }
        }
        // If a tick goes by with no active shooting then be read to cool
        this.activelyShooting = false;
    }

    /*
        Method Name: isActivelyShooting
        Method Parameters: None
        Method Description: Checks if the turret is actively shooting
        Method Return: Boolean
    */
    isActivelyShooting(){
        return this.activelyShooting;
    }

    /*
        Method Name: getInterpolatedHeat
        Method Parameters:
            timePassed:
                The milliseconds since the last tick
        Method Description: Determines the heat of the gun at a given time after the last tick
        Method Return: Float
    */
    getInterpolatedHeat(timePassed){
        // Don't interpolated if still on cooling delay
        if (this.coolingDelayTicks > 0){ return this.heat; }
        return Math.max(0, this.heat - this.bulletHeatCapacity *  timePassed / this.coolingTimeMS);
    }

    /*
        Method Name: isCooling
        Method Parameters: None
        Method Description: Checks if the gun heat manager is performing emergency cooling
        Method Return: Boolean
    */
    isCooling(){
        return this.emergencyCooling;
    }

    /*
        Method Name: shoot
        Method Parameters: None
        Method Description: Increases the heat as a shot has occured
        Method Return: void
        Note: Assumes canShoot has been checked
    */
    shoot(){
        this.activelyShooting = true;
        this.heat = Math.min(this.bulletHeatCapacity, this.heat+1);
        // If heat has reached capacity then start cooling
        if (this.heat >= this.bulletHeatCapacity){
            this.emergencyCooling = true;
            this.coolingDelayTicks = this.maxCoolingDelayTicks;
        }
    }

    /*
        Method Name: canShoot
        Method Parameters: None
        Method Description: Checks if the gun can shoot based on its heat
        Method Return: Boolean
    */
    canShoot(){
        return !this.isCooling();
    }

    /*
        Method Name: display
        Method Parameters:
            timePassed:
                The time in milliseconds since the last tick
            offset:
                The offset of the turret heat indicator on the screen 0 -> first indicator to display, 1 -> indicator displayed above zero, etc...
        Method Description: Displays the heat bar on the screen
        Method Return: void
    */
    display(timePassed, offset=0){
        let shareBorderOffset = offset > 0 ? 1 : 0; 
        let displayHeat = this.getInterpolatedHeat(timePassed);
        // No need to display if no heat
        if (displayHeat == 0){
            return;
        }

        let heatBarWidth = PROGRAM_DATA["heat_bar"]["width"];
        let heatBarHeight = PROGRAM_DATA["heat_bar"]["height"];
        let heatBarBorderColour = PROGRAM_DATA["heat_bar"]["border_colour"];
        let heatBarBorderThickness = PROGRAM_DATA["heat_bar"]["border_thickness"];
        let heatBarColour;
        let interpolatedHeatPercentage = displayHeat/this.bulletHeatCapacity;
        let realHeatPercentage = this.heat/this.bulletHeatCapacity;

        // Determine bar colour
        // Note: The code after the && checks if the cooling will be over next tick
        if (this.isCooling()){
            heatBarColour = PROGRAM_DATA["heat_bar"]["cooling_colour"];
        }else if (realHeatPercentage > PROGRAM_DATA["heat_bar"]["threshold_3"]){
            heatBarColour = PROGRAM_DATA["heat_bar"]["threshold_3_colour"];
        }else if (realHeatPercentage > PROGRAM_DATA["heat_bar"]["threshold_2"]){
            heatBarColour = PROGRAM_DATA["heat_bar"]["threshold_2_colour"];
        }else{
            heatBarColour = PROGRAM_DATA["heat_bar"]["threshold_1_colour"];
        }

        // Change from code to colour object
        heatBarColour = Colour.fromCode(heatBarColour);

        let screenHeight = getScreenHeight();

        // Display borders
        let borderColour = Colour.fromCode(PROGRAM_DATA["heat_bar"]["border_colour"]);
        // Top Border
        noStrokeRectangle(borderColour, 0, screenHeight - 1 - heatBarHeight - heatBarBorderThickness * 2 + 1 - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarWidth + 2 * heatBarBorderThickness, heatBarBorderThickness);
        // Bottom Border
        noStrokeRectangle(borderColour, 0, screenHeight - 1 - heatBarBorderThickness + 1 - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarWidth + 2 * heatBarBorderThickness, heatBarBorderThickness);
        // Left Border
        noStrokeRectangle(borderColour, 0, screenHeight - 1 - heatBarHeight - heatBarBorderThickness * 2 + 1 - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarBorderThickness, heatBarHeight + 2 * heatBarBorderThickness);
        // Right Border
        noStrokeRectangle(borderColour, heatBarWidth + 2 * heatBarBorderThickness - 1, screenHeight - 1 - heatBarHeight - heatBarBorderThickness * 2 + 1- (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarBorderThickness, heatBarHeight + 2 * heatBarBorderThickness);
        
        // Display Heat
        noStrokeRectangle(heatBarColour, heatBarBorderThickness, screenHeight - heatBarHeight - heatBarBorderThickness - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarWidth*interpolatedHeatPercentage, heatBarHeight);
    }
}
// If using NodeJS then export
if (typeof window === "undefined"){
    module.exports = GunHeatManager;
}