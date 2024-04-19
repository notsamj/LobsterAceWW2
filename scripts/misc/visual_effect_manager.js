// TODO: Comments
class VisualEffectManager {
    constructor(gamemode){
        this.gamemode = gamemode;
        this.visualEffects = new NotSamLinkedList();

        // Plane Smoke
        this.planeSmokeLocks = {};
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


    addPlaneExplosion(){
        // TODO
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
        return TemporaryVisualEffect.getOpacity(this.createdTime, this.expireyTimeMS - this.createdTime);
    }

    static getOpacity(createdTime, lifeLengthMS, delay=0){
        return 255 - 255 * (Date.now() - createdTime) / lifeLengthMS;
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
            this.circles.push({"type": "circle", "x": x, "y": y, "diameter": insideSmokeDiameter, "delay": 0, "life_length_ms": insideSmokeLifeLength, "colour": insideSmokeColour});
        }

        // Since all inside smoke is by definition inside we can just use building dimensions for this
        this.bottomY = Math.min(this.bottomY, 0);
        this.topY = Math.max(this.topY, this.buildingY);
        this.leftX = Math.min(this.leftX , this.buildingX);
        this.rightX = Math.max(this.rightX, this.buidlingX + this.buildingXSize);

        // Runaway Smoke
        let runawaySmokeDiameter = dataJSON["runaway_smoke"]["diameter"];
        let runawaySmokeRadius = runawaySmokeRadius/2;
        let runawaySmokeColour = dataJSON["runaway_smoke"]["colour"];
        let runawaySmokeLifeLength = dataJSON["runaway_smoke"]["life_span_ms"];
        let runawaySmokeYPosition = dataJSON["runaway_smoke"]["y_position"];
        let runawaySmokeMaxSpeed = dataJSON["runaway_smoke"]["max_speed"];
        let runawaySmokeDelay = dataJSON["building_collapse"]["life_span_ms"];
        for (let i = 0; i < dataJSON["inside_smoke"]["number"]; i++){
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
            this.circles.push({"x": x, "y": y, "diameter": runawaySmokeDiameter, "delay": runawaySmokeDelay, "life_length_ms": runawaySmokeLifeLength, "colour": runawaySmokeColour, "x_velocity": xVelocity, "y_velocity": yVelocity});
        }
    }

    display(scene, lX, rX, bY, tY){
        // Don't display if too far away
        if (!this.touchesRegion(lX, rX, bY, tY)){ return; }
        strokeWeight(0);

        let currentTime = Date.now();
        let timePassed = currentTime - this.createdTime;

        // Display Smoke
        for (let circleJSON of this.circles){
            // Ignore smoke that hasn't yet been produced
            if (timePassed < circleJSON["delay"]){ continue; }
            let colour = color(circleJSON["colour"]);
            let screenX = scene.getDisplayX(circleJSON["x"], 0, lX, false);
            let screenY = scene.getDisplayY(circleJSON["y"], 0, bY, false);
            let opacity = 5; // TODO
            colour.setAlpha(opacity);
            fill(colour);
            circle(screenX, screenY, circleJSON["diameter"]);
        }

        // Display Building if still around
        if (timePassed < this.buildingLifeSpan){
            let buildingYLeft = this.buildingYSize - timePassed / this.buildingLifeSpan * this.buildingYSize;
            let topY = buildingYLeft;
            fill(this.buildingColour);
            rect(this.buildingX, topY, this.buildingXSize, buildingYLeft);
        }
        strokeWeight(1);
    }
}

class PlaneSmoke extends TemporaryVisualEffect {
    constructor(smokeMiddleX, smokeMiddleY, smokeStage, sizeMultiplier){
        super(PROGRAM_DATA["plane_smoke"]["smoke_life_length_ms"]);
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