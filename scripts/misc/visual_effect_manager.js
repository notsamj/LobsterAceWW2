// TODO: Comments
class VisualEffectManager {
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

    display(scene, lX, bY){
        let rX = lX + getScreenWidth() - 1;
        let tY = bY + getScreenHeight() - 1;
        // Delete all expired effects
        this.visualEffects.deleteWithCondition((visualEffect) => { return visualEffect.isExpired(); });
    
        // Display remaining
        for (let [visualEffect, vEI] of this.visualEffects){
            visualEffect.display(scene, lX, rX, bY, tY);
        }
    }

    addPlaneSmoke(id, smokeStage, planeClass, sizeMultiplier, x, y, planeAngleRAD, planeFacingRight){
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
        this.visualEffects.push(new PlaneSmoke(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier));
    }

    addBuildingCollapse(buildingX, buildingXSize, buildingYSize){
        this.visualEffects.push(new BuildingCollapse(buildingX, buildingXSize, buildingYSize));
    }


    // Size expected: 64 for fighter, 128 for bomber, 8 for bomb?
    addExplosion(size, x, y){
        this.visualEffects.push(new Explosion(size, x, y));
    }
}

// TODO: Comments
class TemporaryVisualEffect {
    constructor(lifeLengthMS){
        this.createdTime = Date.now();
        this.expireyTimeMS = this.createdTime + lifeLengthMS;
        this.leftX = Number.MAX_SAFE_INTEGER; // Placeholder will 100% be overwritten
        this.rightX = Number.MIN_SAFE_INTEGER; // Placeholder will 100% be overwritten
        this.topY = Number.MIN_SAFE_INTEGER; // Placeholder will 100% be overwritten
        this.bottomY = Number.MAX_SAFE_INTEGER; // Placeholder will 100% be overwritten
    }

    getOpacity(){
        return TemporaryVisualEffect.calculateOpacity(this.createdTime, this.expireyTimeMS - this.createdTime);
    }

    static calculateOpacity(createdTime, lifeLengthMS, delay=0){
        return 255 - 255 * (Date.now() - createdTime - delay) / lifeLengthMS;
    }

    isExpired(){
        return Date.now() >= this.expireyTimeMS;
    }

    touchesRegion(lX, rX, bY, tY){
        return !(this.bottomY > tY || this.topY < bY || this.leftX > rX || this.rightX < lX);
    }

    // Abstract
    display(scene, lX, rX, bY, tY){}
}

class Explosion extends TemporaryVisualEffect {
    constructor(size, x, y){
        super(Math.max(PROGRAM_DATA["other_effects"]["explosion"]["secondary_ball"]["life_span_ms"] + PROGRAM_DATA["other_effects"]["explosion"]["secondary_ball"]["delay_ms"], PROGRAM_DATA["other_effects"]["explosion"]["smoke"]["life_span_ms"] + PROGRAM_DATA["other_effects"]["explosion"]["smoke"]["delay_ms"]));
        this.centerX = x;
        this.centerY = y;
        this.size = size;
        this.circles = [];
        this.generateCircles();
    }

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

    display(scene, lX, rX, bY, tY){
        // Don't display if too far away
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }
        strokeWeight(0);

        let currentTime = Date.now();
        let timePassedMS = currentTime - this.createdTime;

        // Display All Circles
        for (let circleJSON of this.circles){
            // Ignore smoke that hasn't yet been produced
            if (timePassedMS < circleJSON["delay_ms"]){ continue; }
            let timePassedAdjustedMS = timePassedMS - circleJSON["delay_ms"];
            let colour = color(circleJSON["colour"]);
            let screenX = scene.getDisplayX(circleJSON["x"], 0, lX, false);
            let screenY = scene.getDisplayY(circleJSON["y"], 0, bY, false);
            let diameter = objectHasKey(circleJSON, "start_diameter") ? ((circleJSON["end_diameter"] - circleJSON["start_diameter"]) * Math.min(timePassedAdjustedMS, circleJSON["growing_time_ms"]) / circleJSON["growing_time_ms"] + circleJSON["start_diameter"]) : circleJSON["diameter"];
            let opacity = TemporaryVisualEffect.calculateOpacity(this.createdTime, circleJSON["life_span_ms"], circleJSON["delay_ms"]);
            // Sometimes circles with opacity <= 0 will be found these should be ignored
            if (opacity > 0){
                colour.setAlpha(opacity);
                fill(colour);
                circle(screenX, screenY, diameter);
            }
        }

        // Display Falling Building if still around
        if (timePassedMS < this.buildingLifeSpan){
            let buildingYLeft = (1 - timePassedMS / this.buildingLifeSpan) * this.buildingYSize;
            let topY = buildingYLeft;
            fill(this.buildingColour);
            rect(this.buildingX, topY, this.buildingXSize, buildingYLeft);
        }
        strokeWeight(1);
    }
}

class BuildingCollapse extends TemporaryVisualEffect {
    constructor(buildingX, buildingXSize, buildingYSize){
        super(Math.max(PROGRAM_DATA["other_effects"]["building_collapse"]["inside_smoke"]["life_span_ms"], PROGRAM_DATA["other_effects"]["building_collapse"]["fake_building"]["life_span_ms"] + PROGRAM_DATA["other_effects"]["building_collapse"]["runaway_smoke"]["life_span_ms"]));
        // Fake Building
        this.buildingX = buildingX;
        this.buildingXSize = buildingXSize;
        this.buildingY = buildingYSize;
        this.buildingYSize = buildingYSize;
        this.buildingLifeSpan = PROGRAM_DATA["other_effects"]["building_collapse"]["fake_building"]["life_span_ms"];
        this.buildingColour = PROGRAM_DATA["building_data"]["building_colour"];
        // Smoke
        this.circles = [];
        this.generateCircles();
    }

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


    display(scene, lX, rX, bY, tY){
        // Don't display if too far away
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }

        strokeWeight(0);

        let currentTime = Date.now();
        let timePassedMS = currentTime - this.createdTime;

        // Display All Smoke
        for (let circleJSON of this.circles){
            // Ignore smoke that hasn't yet been produced
            if (timePassedMS < circleJSON["delay_ms"]){ continue; }
            let colour = color(circleJSON["colour"]);
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
                fill(colour);
                circle(screenX, screenY, circleJSON["diameter"]);
            }
        }

        strokeWeight(1);

        // Display Falling Building if still around
        if (timePassedMS < this.buildingLifeSpan){
            let buildingYLeft = (1 - timePassedMS / this.buildingLifeSpan) * this.buildingYSize;
            let topY = buildingYLeft;
            fill(this.buildingColour);
            let screenX = scene.getDisplayX(this.buildingX, 0, lX, false);
            let screenY = scene.getDisplayY(topY, 0, bY, false);
            rect(screenX, screenY, this.buildingXSize, buildingYLeft);
        }
    }

}

class PlaneSmoke extends TemporaryVisualEffect {
    constructor(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier){
        super(PROGRAM_DATA["plane_smoke"]["smoke_life_span_ms"]);
        this.circles = [];
        this.generateCircles(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier);
    }

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

    display(scene, lX, rX, bY, tY){
        // Don't display if too far away
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }
        let opacity = this.getOpacity();
        strokeWeight(0);
        for (let circleJSON of this.circles){
            let colour = color(circleJSON["colour"]);
            colour.setAlpha(opacity);
            fill(colour);
            let screenX = scene.getDisplayX(circleJSON["x"], 0, lX, false);
            let screenY = scene.getDisplayY(circleJSON["y"], 0, bY, false);
            circle(screenX, screenY, circleJSON["diameter"]);
        }
        strokeWeight(1);
    }
}