/*
    Class Name: VisualEffectManager
    Description: Manages visual effects in the game space
*/
class VisualEffectManager {
    /*
        Method Name: constructor
        Method Parameters:
            gamemode:
                The gamemode associated with the visual effects
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(gamemode){
        this.gamemode = gamemode;
        this.visualEffects = new NotSamLinkedList();

        // Plane Smoke
        this.planeSmokeLocks = {};

        // Register events
        this.gamemode.getEventHandler().addHandler("building_collapse", (eventDetails) => {
            this.addBuildingCollapse(eventDetails["x"], eventDetails["building_x_size"], eventDetails["building_y_size"]);
        });


        this.gamemode.getEventHandler().addHandler("explode", (eventDetails) => {
            this.addExplosion(eventDetails["size"], eventDetails["x"], eventDetails["y"]);
        });
    }

    /*
        Method Name: display
        Method Parameters:
            scene:
                The scene to display visual effects on
        Method Description: Displays visual effects on the screen
        Method Return: void
    */
    display(scene, lX, bY){
        let rX = lX + getZoomedScreenWidth() - 1;
        let tY = bY + getZoomedScreenHeight() - 1;
        
        // Delete all expired effects
        this.visualEffects.deleteWithCondition((visualEffect) => { return visualEffect.isExpired(); });
    
        // Display remaining
        for (let [visualEffect, vEI] of this.visualEffects){
            visualEffect.display(scene, lX, rX, bY, tY);
        }
    }

    /*
        Method Name: addPlaneSmoke
        Method Parameters:
            id:
                The id of the plane that is smoking
            smokeStage:
                The stage of destruction of the plane
            planeClass:
                The class of the plane that is smoking
            sizeMultiplier:
                The size multiplier of the plane (1 for 64x64 fighter plane, 2 for 128x128 bomber plane)
        Method Description: Adds plane smoke coming out of a plane
        Method Return: void
    */
    addPlaneSmoke(id, smokeStage, planeClass, sizeMultiplier, x, y, planeAngleRAD, planeFacingRight){
        // TODO: Come up with something better for this
        if (typeof window === "undefined"){ return; }
        // Create lock if doesn't exist
        if (!objectHasKey(this.planeSmokeLocks, id)){
            this.planeSmokeLocks[id] = new CooldownLock(PROGRAM_DATA["plane_smoke"]["plane_smoke_interval_ms"]);
        }
        let lock = this.planeSmokeLocks[id];
        // If not ready to produce plane smoke then don't
        if (lock.notReady()){ return; }

        // Going to produce so lock
        lock.lock();
        let planeTailOffsetX = PROGRAM_DATA["plane_data"][planeClass]["tail_offset_x"];
        let planeTailOffsetY = PROGRAM_DATA["plane_data"][planeClass]["tail_offset_y"];
        let smokeMiddleX = Math.cos(planeAngleRAD) * (planeTailOffsetX * (planeFacingRight ? 1 : -1)) - Math.sin(planeAngleRAD) * planeTailOffsetY + x;
        let smokeMiddleY = Math.sin(planeAngleRAD) * (planeTailOffsetX * (planeFacingRight ? 1 : -1)) + Math.cos(planeAngleRAD) * planeTailOffsetY + y;
        
        // Create the plane smoke
        this.visualEffects.push(new PlaneSmoke(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier));
    }

    /*
        Method Name: addBuildingCollapse
        Method Parameters:
            buildingX:
                The x location of the building
            buildingXSize:
                The x size of the building
            buildingYSize:
                The y size of the building
        Method Description: Adds a building collapse effect
        Method Return: void
    */
    addBuildingCollapse(buildingX, buildingXSize, buildingYSize){
        // TODO: Come up with something better for this
        if (typeof window === "undefined"){ return; }
        this.visualEffects.push(new BuildingCollapse(buildingX, buildingXSize, buildingYSize));
    }


    /*
        Method Name: addExplosion
        Method Parameters:
            size:
                The size of the explosion
            x:
                The x location of the explosion
            y:
                The y location of the explosion
        Method Description: Creates an explosion of a given size at a given point
        Method Return: void
        Note: 64 for fighter, 128 for bomber, 8 for bomb?
    */
    addExplosion(size, x, y){
        // TODO: Come up with something better for this
        if (typeof window === "undefined"){ return; }
        this.visualEffects.push(new Explosion(size, x, y));
    }
}

/*
    Class Name: TemporaryVisualEffect
    Description: A visual effect that gives for a set amount of time
*/
class TemporaryVisualEffect {
    /*
        Method Name: constructor
        Method Parameters:
            lifeLengthMS:
                The length of life of the effect
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(lifeLengthMS){
        this.createdTime = Date.now();
        this.expireyTimeMS = this.createdTime + lifeLengthMS;
        this.leftX = Number.MAX_SAFE_INTEGER; // Placeholder will 100% be overwritten
        this.rightX = Number.MIN_SAFE_INTEGER; // Placeholder will 100% be overwritten
        this.topY = Number.MIN_SAFE_INTEGER; // Placeholder will 100% be overwritten
        this.bottomY = Number.MAX_SAFE_INTEGER; // Placeholder will 100% be overwritten
    }

    /*
        Method Name: getOpacity
        Method Parameters: None
        Method Description: Determines the opacity of the effect assuming a linear decline from creation to end
        Method Return: Float
    */
    getOpacity(){
        return TemporaryVisualEffect.calculateOpacity(this.createdTime, this.expireyTimeMS - this.createdTime);
    }

    /*
        Method Name: calculateOpacity
        Method Parameters:
            createdTime:
                The time the effect was created
            lifeLengthMS:
                The lifespan in ms of the effect
            delay:
                The delay between the creation time and the actual appearance of the effect
        Method Description: Determines the opacity of the effect assuming a linear decline from creation to end with an optional delay
        Method Return: Float
    */
    static calculateOpacity(createdTime, lifeLengthMS, delay=0){
        return 1 - (Date.now() - createdTime - delay) / lifeLengthMS;
    }

    /*
        Method Name: isExpired
        Method Parameters: None
        Method Description: Checks if the effect is expired
        Method Return: Boolean
    */
    isExpired(){
        return Date.now() >= this.expireyTimeMS;
    }

    /*
        Method Name: touchesRegion
        Method Parameters:
            lX:
                The game x of the left side of the screen
            rX:
                The game x of the right side of the screen
            bY:
                The game y of the bottom of the screen
            tY:
                The game y of the top of the screen
        Method Description: Checks if the screen represented by four integers covers part of this effect
        Method Return: Boolean
    */
    touchesRegion(lX, rX, bY, tY){
        return !(this.bottomY > tY || this.topY < bY || this.leftX > rX || this.rightX < lX);
    }

    // Abstract
    display(scene, lX, rX, bY, tY){}
}

/*
    Class Name: Explosion
    Description: A type of TemporaryVisualEffect that represents an explosion
*/
class Explosion extends TemporaryVisualEffect {
    /*
        Method Name: constructor
        Method Parameters:
            size:
                The size of the explosion
            x:
                The x coordinate of the explosion
            y:
                The y coordinate of the explosion
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(size, x, y){
        super(Math.max(PROGRAM_DATA["other_effects"]["explosion"]["secondary_ball"]["life_span_ms"] + PROGRAM_DATA["other_effects"]["explosion"]["secondary_ball"]["delay_ms"], PROGRAM_DATA["other_effects"]["explosion"]["smoke"]["life_span_ms"] + PROGRAM_DATA["other_effects"]["explosion"]["smoke"]["delay_ms"]));
        this.centerX = x;
        this.centerY = y;
        this.size = size;
        this.circles = [];
        this.generateCircles();
    }

    /*
        Method Name: generateCircles
        Method Parameters: None
        Method Description: Creates the circles that represent the explosion
        Method Return: void
    */
    generateCircles(){
        let dataJSON = PROGRAM_DATA["other_effects"]["explosion"];

        // Secondary Ball
        let secondaryBallStartDiameter = dataJSON["secondary_ball"]["start_diameter"]*this.size;
        let secondaryBallEndDiameter = dataJSON["secondary_ball"]["end_diameter"]*this.size;
        let secondaryBallGrowingTimeMS = dataJSON["secondary_ball"]["growing_time_ms"];
        let secondaryBallColour = dataJSON["secondary_ball"]["colour"];
        let secondaryBallLifeSpan = dataJSON["secondary_ball"]["life_span_ms"];
        let secondaryBallDelayMS = dataJSON["secondary_ball"]["delay_ms"];
        this.circles.push({"x": this.centerX, "y": this.centerY, "growing_time_ms": secondaryBallGrowingTimeMS, "start_diameter": secondaryBallStartDiameter, "end_diameter": secondaryBallEndDiameter, "delay_ms": secondaryBallDelayMS, "life_span_ms": secondaryBallLifeSpan, "colour": secondaryBallColour});
        
        // Center Ball
        let centerBallStartDiameter = dataJSON["center_ball"]["start_diameter"]*this.size;
        let centerBallEndDiameter = dataJSON["center_ball"]["end_diameter"]*this.size;
        let centerBallGrowingTimeMS = dataJSON["center_ball"]["growing_time_ms"];
        let centerBallColour = dataJSON["center_ball"]["colour"];
        let centerBallLifeSpan = dataJSON["center_ball"]["life_span_ms"];
        this.circles.push({"x": this.centerX, "y": this.centerY, "growing_time_ms": centerBallGrowingTimeMS, "start_diameter": centerBallStartDiameter, "end_diameter": centerBallEndDiameter, "delay_ms": 0, "life_span_ms": centerBallLifeSpan, "colour": centerBallColour});

        // Smoke
        let smokeDiameter = dataJSON["smoke"]["diameter"]*this.size;
        let smokeLifeSpanMS = dataJSON["smoke"]["life_span_ms"];
        let smokeDelay = dataJSON["smoke"]["delay_ms"];
        let smokeColour = dataJSON["smoke"]["colour"];
        for (let i = 0; i < dataJSON["smoke"]["number"]; i++){
            let angle = toRadians(randomNumberInclusive(0,359));
            let x = this.centerX + Math.cos(angle) * secondaryBallEndDiameter/2;
            let y = this.centerY + Math.sin(angle) * secondaryBallEndDiameter/2;
            this.circles.push({"x": x, "y": y, "diameter": smokeDiameter, "delay_ms": smokeDelay, "colour": smokeColour, "life_span_ms": smokeLifeSpanMS});
        }

        // Calculate max edges
        this.bottomY = this.centerY - dataJSON["secondary_ball"]["end_diameter"]*this.size/2 - dataJSON["smoke"]["diameter"]*this.size/2;
        this.topY = this.centerY + dataJSON["secondary_ball"]["end_diameter"]*this.size/2 + dataJSON["smoke"]["diameter"]*this.size/2;
        this.leftX = this.centerX - dataJSON["secondary_ball"]["end_diameter"]*this.size/2 - dataJSON["smoke"]["diameter"]*this.size/2;
        this.rightX = this.centerX + dataJSON["secondary_ball"]["end_diameter"]*this.size/2 + dataJSON["smoke"]["diameter"]*this.size/2;
    }

    /*
        Method Name: display
        Method Parameters:
            scene:
                The scene that the effect will be displayed on
            lX:
                The game x of the left side of the screen
            rX:
                The game x of the right side of the screen
            bY:
                The game y of the bottom of the screen
            tY:
                The game y of the top of the screen
        Method Description: Displays the effect on the screen
        Method Return: void
    */
    display(scene, lX, rX, bY, tY){
        // Don't display if too far away
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        let currentTime = Date.now();
        let timePassedMS = currentTime - this.createdTime;

        // Display All Circles
        for (let circleJSON of this.circles){
            // Ignore smoke that hasn't yet been produced
            if (timePassedMS < circleJSON["delay_ms"]){ continue; }
            let timePassedAdjustedMS = timePassedMS - circleJSON["delay_ms"];
            let colour = Colour.fromCode(circleJSON["colour"]);
            let screenX = scene.getDisplayX(circleJSON["x"], 0, lX, false);
            let screenY = scene.getDisplayY(circleJSON["y"], 0, bY, false);
            let diameter = objectHasKey(circleJSON, "start_diameter") ? ((circleJSON["end_diameter"] - circleJSON["start_diameter"]) * Math.min(timePassedAdjustedMS, circleJSON["growing_time_ms"]) / circleJSON["growing_time_ms"] + circleJSON["start_diameter"]) : circleJSON["diameter"];
            let opacity = TemporaryVisualEffect.calculateOpacity(this.createdTime, circleJSON["life_span_ms"], circleJSON["delay_ms"]);
            // Sometimes circles with opacity <= 0 will be found these should be ignored
            if (opacity > 0){
                colour.setAlpha(opacity);
                noStrokeCircle(colour, screenX, screenY, diameter*gameZoom);
            }
        }
    }
}

/*
    Class Name: BuildingCollapse
    Description: A TemporaryVisualEffect. Represents the collapse of a building.
*/
class BuildingCollapse extends TemporaryVisualEffect {
    /*
        Method Name: constructor
        Method Parameters:
            buildingX:
                The x location of the building
            buildingXSize:
                The x size of the building
            buildingYSize:
                The y size of the building
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(buildingX, buildingXSize, buildingYSize){
        super(Math.max(PROGRAM_DATA["other_effects"]["building_collapse"]["inside_smoke"]["life_span_ms"], PROGRAM_DATA["other_effects"]["building_collapse"]["fake_building"]["life_span_ms"] + PROGRAM_DATA["other_effects"]["building_collapse"]["runaway_smoke"]["life_span_ms"]));
        // Fake Building
        this.buildingX = buildingX;
        this.buildingXSize = buildingXSize;
        this.buildingY = buildingYSize;
        this.buildingYSize = buildingYSize;
        this.buildingLifeSpan = PROGRAM_DATA["other_effects"]["building_collapse"]["fake_building"]["life_span_ms"];
        this.buildingColour = Colour.fromCode(PROGRAM_DATA["building_data"]["building_colour"]);
        // Smoke
        this.circles = [];
        this.generateCircles();
    }

    /*
        Method Name: generateCircles
        Method Parameters: None
        Method Description: Creates the circles that represent the smoke of the collapse
        Method Return: void
    */
    generateCircles(){
        let dataJSON = PROGRAM_DATA["other_effects"]["building_collapse"];

        // Inside Smoke
        let insideSmokeDiameter = dataJSON["inside_smoke"]["diameter"];
        let insideSmokeRadius = insideSmokeDiameter/2;
        let insideSmokeColour = dataJSON["inside_smoke"]["colour"];
        let insideSmokeLifeLength = dataJSON["inside_smoke"]["life_span_ms"];
        for (let i = 0; i < dataJSON["inside_smoke"]["number"]; i++){
            let x = this.buildingX + randomNumberInclusive(insideSmokeRadius, this.buildingXSize - insideSmokeRadius);
            let y = this.buildingY - randomNumberInclusive(insideSmokeRadius, this.buildingYSize - insideSmokeRadius);
            this.circles.push({"x": x, "y": y, "diameter": insideSmokeDiameter, "delay_ms": 0, "life_span_ms": insideSmokeLifeLength, "colour": insideSmokeColour});
        }

        // Since all inside smoke is by definition inside we can just use building dimensions for this
        this.bottomY = Math.min(this.bottomY, 0);
        this.topY = Math.max(this.topY, this.buildingY);
        this.leftX = Math.min(this.leftX , this.buildingX);
        this.rightX = Math.max(this.rightX, this.buidlingX + this.buildingXSize);

        // Runaway Smoke
        let runawaySmokeDiameter = dataJSON["runaway_smoke"]["diameter"];
        let runawaySmokeRadius = runawaySmokeDiameter/2;
        let runawaySmokeColour = dataJSON["runaway_smoke"]["colour"];
        let runawaySmokeLifeLength = dataJSON["runaway_smoke"]["life_span_ms"];
        let runawaySmokeYPosition = dataJSON["runaway_smoke"]["y_position"];
        let runawaySmokeMaxSpeed = dataJSON["runaway_smoke"]["max_speed"];
        let runawaySmokeDelayMS = dataJSON["fake_building"]["life_span_ms"];
        for (let i = 0; i < dataJSON["runaway_smoke"]["number"]; i++){
            let x = this.buildingX + randomNumberInclusive(insideSmokeRadius, this.buildingXSize - insideSmokeRadius);
            let y = this.buildingY * runawaySmokeYPosition - randomNumberInclusive(insideSmokeRadius, this.buildingYSize * runawaySmokeYPosition - insideSmokeRadius);
            let xVelocity = randomNumberInclusive(-1 * runawaySmokeMaxSpeed, runawaySmokeMaxSpeed);
            let yVelocity = randomNumberInclusive(0, runawaySmokeMaxSpeed);
            // The border velocity stuff is basically for seeing the furthest left/right point of the smoke at any poin t
            let borderTopYVelocity = yVelocity > 0 ? yVelocity : 0;
            let borderBottomYVelocity = yVelocity < 0 ? yVelocity : 0;
            this.bottomY = Math.min(this.bottomY, y - runawaySmokeRadius + borderBottomYVelocity / 1000 * runawaySmokeLifeLength);
            this.topY = Math.max(this.topY, y + runawaySmokeRadius + borderTopYVelocity / 1000 * runawaySmokeLifeLength);
            let borderRightXVelocity = xVelocity > 0 ? xVelocity : 0;
            let borderLeftXVelocity = xVelocity < 0 ? xVelocity : 0;
            this.leftX = Math.min(this.leftX , x - runawaySmokeRadius + borderLeftXVelocity / 1000 * runawaySmokeLifeLength);
            this.rightX = Math.max(this.rightX, x + runawaySmokeRadius + borderRightXVelocity / 1000 * runawaySmokeLifeLength);
            this.circles.push({"x": x, "y": y, "diameter": runawaySmokeDiameter, "delay_ms": runawaySmokeDelayMS, "life_span_ms": runawaySmokeLifeLength, "colour": runawaySmokeColour, "x_velocity": xVelocity, "y_velocity": yVelocity});
        }
    }

    /*
        Method Name: display
        Method Parameters:
            scene:
                The scene that the effect will be displayed on
            lX:
                The game x of the left side of the screen
            rX:
                The game x of the right side of the screen
            bY:
                The game y of the bottom of the screen
            tY:
                The game y of the top of the screen
        Method Description: Displays the effect on the screen
        Method Return: void
    */
    display(scene, lX, rX, bY, tY){
        // Don't display if too far away
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        let currentTime = Date.now();
        let timePassedMS = currentTime - this.createdTime;

        // Display All Smoke
        for (let circleJSON of this.circles){
            // Ignore smoke that hasn't yet been produced
            if (timePassedMS < circleJSON["delay_ms"]){ continue; }
            let colour = Colour.fromCode(circleJSON["colour"]);
            let x = circleJSON["x"];
            let y = circleJSON["y"];
            // Move if has velocity
            if (objectHasKey(circleJSON, "x_velocity")){
                x += circleJSON["x_velocity"] * (timePassedMS - circleJSON["delay_ms"]) / 1000;
            }
            // Move if has velocity
            if (objectHasKey(circleJSON, "y_velocity")){
                y += circleJSON["y_velocity"] * (timePassedMS - circleJSON["delay_ms"]) / 1000;
            }
            let screenX = scene.getDisplayX(x, 0, lX, false);
            let screenY = scene.getDisplayY(y, 0, bY, false);
            let opacity = TemporaryVisualEffect.calculateOpacity(this.createdTime, circleJSON["life_span_ms"], circleJSON["delay_ms"]);
            // Sometimes circles with opacity <= 0 will be found these should be ignored
            if (opacity > 0){
                colour.setAlpha(opacity);
                noStrokeCircle(colour, screenX, screenY, circleJSON["diameter"]*gameZoom);
            }
        }

        // Display Falling Building if still around
        if (timePassedMS < this.buildingLifeSpan){
            let buildingYLeft = (1 - timePassedMS / this.buildingLifeSpan) * this.buildingYSize;
            let topY = buildingYLeft;
            let screenX = scene.getDisplayX(this.buildingX, 0, lX, false);
            let screenY = scene.getDisplayY(topY, 0, bY, false);
            strokeRectangle(this.buildingColour, screenX, screenY, this.buildingXSize * gameZoom, buildingYLeft*gameZoom);
        }
    }

}

/*
    Class Name: PlaneSmoke
    Description: A TemporaryVisualEffect. Represents smoke coming out of a damaged plane.
*/
class PlaneSmoke extends TemporaryVisualEffect {
    /*
        Method Name: constructor
        Method Parameters:
            smokeMiddleX:
                The x of the center of the smoke cloud
            smokeMiddleY:
                THe y of the center of the smoke cloud
            smokeStage:
                The stage of destruction of the associated plane
            sizeMultiplier:
                The size multiplier of the smoke (1 for 64size fighter planes, 2 for 128size bomber planes)
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier){
        super(PROGRAM_DATA["plane_smoke"]["smoke_life_span_ms"]);
        this.circles = [];
        this.generateCircles(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier);
    }

    /*
        Method Name: generateCircles
        Method Parameters:
            smokeMiddleX:
                The x of the center of the smoke cloud
            smokeMiddleY:
                THe y of the center of the smoke cloud
            smokeStage:
                The stage of destruction of the associated plane
            sizeMultiplier:
                The size multiplier of the smoke (1 for 64size fighter planes, 2 for 128size bomber planes)
        Method Description: Generates the circles that represent the plane smoke
        Method Return: void
    */
    generateCircles(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier){
        let smokeStageInfo = PROGRAM_DATA["plane_smoke"]["stage_details"][smokeStage-1];
        for (let circleTypeJSON of smokeStageInfo){
            let diameter = circleTypeJSON["diameter"]*sizeMultiplier;
            let radius = diameter/2;
            let colour = circleTypeJSON["colour"];
            for (let i = 0; i < circleTypeJSON["number"]; i++){
                let xOffset = randomNumberInclusive(-1 * circleTypeJSON["spread"]*sizeMultiplier, circleTypeJSON["spread"]*sizeMultiplier);
                let yOffset = randomNumberInclusive(-1 * circleTypeJSON["spread"]*sizeMultiplier, circleTypeJSON["spread"]*sizeMultiplier);
                let circleX = smokeMiddleX + xOffset;
                let circleY = smokeMiddleY + yOffset;
                this.bottomY = Math.min(this.bottomY, circleY - radius);
                this.topY = Math.max(this.topY, circleY + radius);
                this.leftX = Math.min(this.leftX , circleX - radius);
                this.rightX = Math.max(this.rightX, circleX + radius);
                this.circles.push({"x": circleX, "y": circleY, "diameter": diameter, "colour": colour});
            }
        }
    }

    /*
        Method Name: display
        Method Parameters:
            scene:
                The scene that the effect will be displayed on
            lX:
                The game x of the left side of the screen
            rX:
                The game x of the right side of the screen
            bY:
                The game y of the bottom of the screen
            tY:
                The game y of the top of the screen
        Method Description: Displays the effect on the screen
        Method Return: void
    */
    display(scene, lX, rX, bY, tY){
        // Don't display if too far away
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }
        let opacity = this.getOpacity();
        for (let circleJSON of this.circles){
            let colour = Colour.fromCode(circleJSON["colour"]);
            colour.setAlpha(opacity);
            let screenX = scene.getDisplayX(circleJSON["x"], 0, lX, false);
            let screenY = scene.getDisplayY(circleJSON["y"], 0, bY, false);
            noStrokeCircle(colour, screenX, screenY, circleJSON["diameter"]*gameZoom);
        }
    }
}
// If using NodeJS then export
if (typeof window === "undefined"){
    module.exports = VisualEffectManager;
}