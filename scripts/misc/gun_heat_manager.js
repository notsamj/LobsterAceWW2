class GunHeatManager {
    constructor(bulletHeatCapacity, coolingTimeMS){
        this.bulletHeatCapacity = bulletHeatCapacity;
        this.maxCoolingDelayTicks = Math.ceil(PROGRAM_DATA["heat_bar"]["cooling_delay_ms"] / PROGRAM_DATA["settings"]["ms_between_ticks"]);
        this.coolingDelayTicks = 0;
        this.coolingTimeMS = coolingTimeMS;
        this.heat = 0;
        this.emergencyCooling = false;
        this.activelyShooting = false;
    }

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

    isActivelyShooting(){
        return this.activelyShooting;
    }

    getInterpolatedHeat(timePassed){
        // Don't interpolated if still on cooling delay
        if (this.coolingDelayTicks > 0){ return this.heat; }
        return Math.max(0, this.heat - this.bulletHeatCapacity *  timePassed / this.coolingTimeMS);
    }

    isCooling(){
        return this.emergencyCooling;
    }

    // Assumes allowShoot has been checked
    shoot(){
        this.activelyShooting = true;
        this.heat = Math.min(this.bulletHeatCapacity, this.heat+1);
        // If heat has reached capacity then start cooling
        if (this.heat >= this.bulletHeatCapacity){
            this.emergencyCooling = true;
            this.coolingDelayTicks = this.maxCoolingDelayTicks;
        }
    }

    canShoot(){
        return !this.isCooling();
    }

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
        

        let screenHeight = getScreenHeight();

        strokeWeight(0);

        // Display borders

        // Top Border
        fill(PROGRAM_DATA["heat_bar"]["border_colour"])
        rect(0, screenHeight - 1 - heatBarHeight - heatBarBorderThickness * 2 + 1 - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarWidth + 2 * heatBarBorderThickness, heatBarBorderThickness);
        // Bottom Border
        rect(0, screenHeight - 1 - heatBarBorderThickness + 1 - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarWidth + 2 * heatBarBorderThickness, heatBarBorderThickness);
        // Left Border
        rect(0, screenHeight - 1 - heatBarHeight - heatBarBorderThickness * 2 + 1 - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarBorderThickness, heatBarHeight + 2 * heatBarBorderThickness);
        // Right Border
        rect(heatBarWidth + 2 * heatBarBorderThickness - 1, screenHeight - 1 - heatBarHeight - heatBarBorderThickness * 2 + 1- (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarBorderThickness, heatBarHeight + 2 * heatBarBorderThickness);
        
        // Display Heat
        fill(heatBarColour)
        rect(heatBarBorderThickness, screenHeight - heatBarHeight - heatBarBorderThickness - (heatBarHeight+heatBarBorderThickness*2-1) * offset, heatBarWidth*interpolatedHeatPercentage, heatBarHeight);

        strokeWeight(1);
    }
}