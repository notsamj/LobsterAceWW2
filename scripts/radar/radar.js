// When this is opened in NodeJS, import the required files
if (typeof window === "undefined"){
    PROGRAM_DATA = require("../../data/data_json.js");
    helperFunctions = require("../general/helper_functions.js");
    getImage = helperFunctions.getImage;
}
/*
    Class Name: Radar
    Description: A radar showing positions of enemies.
*/
class Radar {
     /*
        Method Name: constructor
        Method Parameters:
            entity:
                The entity to whom the radar belongs
            tickLockLength:
                The number of ticks between radar updates
            enabled:
                Whether or not the radar is enabled
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(entity, tickLockLength, enabled){
        this.size = PROGRAM_DATA["radar"]["size"]; // MUST BE EVEN
        this.entity = entity;
        this.blipSize = PROGRAM_DATA["radar"]["blip_size"];
        this.radarOutline = getImage("radar_outline");
        this.distanceMultiplierA = PROGRAM_DATA["radar"]["distance_multiplier_a"];
        this.bIndex = 0;
        this.b = PROGRAM_DATA["radar"]["b"][this.bIndex];
        this.borderWidth = PROGRAM_DATA["radar"]["border_width"];
        this.radarData = new NotSamLinkedList();
        
        this.fighterWeight = PROGRAM_DATA["radar"]["fighter_weight"];
        this.bomberWeight = PROGRAM_DATA["radar"]["bomber_weight"];
        this.friendlyFighterWeight = PROGRAM_DATA["radar"]["fighter_weight"];
        this.friendlyBomberWeight = PROGRAM_DATA["radar"]["bomber_weight"];
        this.enemyFighterWeight = PROGRAM_DATA["radar"]["fighter_weight"];
        this.enemyBomberWeight = PROGRAM_DATA["radar"]["bomber_weight"];
        this.buildingWeight = PROGRAM_DATA["radar"]["building_weight"];
        this.bombHitLocationWeight = PROGRAM_DATA["radar"]["bomb_hit_location_weight"];

        this.friendlyFighterColour = PROGRAM_DATA["radar"]["friendly_fighter_colour"];
        this.enemyFighterColour = PROGRAM_DATA["radar"]["enemy_fighter_colour"];
        this.friendlyBomberColour = PROGRAM_DATA["radar"]["friendly_bomber_colour"];
        this.enemyBomberColour = PROGRAM_DATA["radar"]["enemy_bomber_colour"];
        this.buildingColour = PROGRAM_DATA["radar"]["building_colour"];
        this.bombHitLocationColour = PROGRAM_DATA["radar"]["bomb_hit_location_colour"];

        this.enabled = enabled;
        this.tickLock = new TickLock(tickLockLength);
        this.radarZoomChangeLock = new Lock();
    }


    /*
        Method Name: setEnabled
        Method Parameters:
            enabled:
                A boolean, whether or not the radar is enabled
        Method Description: Setter
        Method Return: void
    */
    setEnabled(enabled){
        this.enabled = enabled;
    }

    /*
        Method Name: getScreenX
        Method Parameters: None
        Method Description: Determine the x location of the radar with respect to the screen
        Method Return: Integer
    */
    getScreenX(){
        return getScreenWidth() - this.radarOutline.width - 1;
    }

    /*
        Method Name: getScreenY
        Method Parameters: None
        Method Description: Determine the y location of the radar with respect to the screen
        Method Return: Integer
    */
    getScreenY(){
        return 1;
    }

    /*
        Method Name: drawBlip
        Method Parameters:
            bestBlipObject:
                Data about a blip, JSON Object
            screenX:
                x location to draw the blip
            screenY:
                y location to draw the blip
        Method Description: Draw a blip on the screen
        Method Return: void
    */
    drawBlip(bestBlipObject, screenX, screenY){
        let blipColour = Colour.fromCode(bestBlipObject["colour"]);
        strokeRectangle(blipColour, screenX, screenY, this.blipSize, this.blipSize);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the radar on the screen
        Method Return: void
    */
    display(){
        let screenX = this.getScreenX();
        let screenY = this.getScreenY();
        displayImage(this.radarOutline, screenX, screenY);
        for (let [positionObject, pI] of this.radarData){
            let bestCompetitor = positionObject["competitors"][0]; // Always at least 1
            for (let i = 1; i < positionObject["competitors"].length; i++){
                if (positionObject["competitors"][i]["weight"] > bestCompetitor["weight"]){
                    bestCompetitor = positionObject["competitors"][i];
                }
            }
            // Best competitor colour has been found (most weight)
            this.drawBlip(bestCompetitor, screenX + this.borderWidth + this.blipSize * positionObject["x_i"], screenY + this.borderWidth + this.blipSize * positionObject["y_i"]);
        }
        let range = this.distanceMultiplierA * Math.pow(this.b, (this.size-1)/2);
        let infoString = `Range: ${Math.floor(range)}, a: ${this.distanceMultiplierA}, b:${this.b}`;
        makeText(infoString, screenX+this.radarOutline.width/2, screenY+this.radarOutline.height, PROGRAM_DATA["radar"]["text_box_width"], PROGRAM_DATA["radar"]["text_box_height"], Colour.fromCode(PROGRAM_DATA["radar"]["text_colour"]), PROGRAM_DATA["radar"]["text_size"], "center", "top");
    }

    /*
        Method Name: resetRadar
        Method Parameters: None
        Method Description: Resets the radar
        Method Return: void
    */
    resetRadar(){
        this.radarData.clear();
    }

    /*
        Method Name: placeOnRadar
        Method Parameters:
            objectX:
                The x location of an object
            objectY:
                The y location of an object
            colour:
                Colour of object placed on radar
            weight:
                The importance of the object
        Method Description: Places an object on the radar
        Method Return: void
    */
    placeOnRadar(objectX, objectY, colour, weight=1){
        let myX = this.entity.getX();
        let myY = this.entity.getY();
        let xDistance = Math.abs(myX-objectX);
        let yDistance = Math.abs(myY-objectY);
        let adjustedXDistance = xDistance / this.distanceMultiplierA;
        let adjustedYDistance = yDistance / this.distanceMultiplierA;
        let logX = Math.log(adjustedXDistance);
        let logY = Math.log(adjustedYDistance);
        let xOffsetAmount;
        let yOffsetAmount;
        let logB = Math.log(this.b);

        // If distance is low it's a special case
        if (xDistance == 0 || logX < 0){
            xOffsetAmount = 0;
        }else{
            xOffsetAmount = Math.min(Math.floor(logX / logB), (this.size - 1)/2);
        }

        // If distance is low it's a special case
        if (yDistance == 0 || logY < 0){
            yOffsetAmount = 0;
        }else{
            yOffsetAmount = Math.min(Math.floor(logY / logB), (this.size - 1)/2);
        }

        let x;
        let y;

        // Determine x
        if (objectX < myX){
            x = Math.floor(this.size/2)+1 - xOffsetAmount;
        }else{ // if (objectX >= myX
            x = Math.floor(this.size/2)+1 + xOffsetAmount;
        }

        // Determine y
        if (objectY < myY){
            y = Math.floor(this.size/2)+1 + yOffsetAmount;
        }else{ // if (objectY >= myY
            y = Math.floor(this.size/2)+1 - yOffsetAmount;
        }

        // Convert to index
        let xI = x - 1;
        let yI = y - 1;

        let positionFound = false;
        // Check if position data exists at xI, yI
        for (let [positionObject, pI] of this.radarData){
            if (positionObject["x_i"] == xI && positionObject["y_i"] == yI){
                positionFound = true;
                let competitorFound = false;
                for (let competitor of positionObject["competitors"]){
                    if (competitor["colour"] == colour){
                        competitorFound = true;
                        competitor["weight"] += weight;
                        break;
                    }
                }
                // If we haven't found our colour in this spot then add it
                if (!competitorFound){
                    positionObject["competitors"].push({"colour": colour, "weight": weight});
                }
                break;
            }
        }
        // If not position present already, add
        if (!positionFound){
            this.radarData.push({"x_i": xI, "y_i": yI, "competitors": [{"colour": colour, "weight": weight}]});
        }
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Handles actions within a tick for the radar
        Method Return: void
    */
    tick(){
        // Sometimes radars are disabled (like other human planes in multiplayer, they don't need it enabled)
        if (this.isDisabled()){ return; }
        this.tickLock.tick();

        // Check for size change
        this.checkForSizeChange();

        // Don't update if ticklock not ready
        if (!this.tickLock.isReady()){ return; }

        // Reset the lock because going to update
        this.tickLock.lock();
        this.update();
    }

    /*
        Method Name: isDisabled
        Method Parameters: None
        Method Description: Checks if the radar is disabled
        Method Return: Boolean
    */
    isDisabled(){
        return !this.isEnabled();
    }

    /*
        Method Name: isEnabled
        Method Parameters: None
        Method Description: Checks if the radar is enabled
        Method Return: Boolean
    */
    isEnabled(){
        return this.enabled;
    }

    /*
        Method Name: checkForSizeChange
        Method Parameters: None
        Method Description: Checks if the user wishes to change the b value of the radar
        Method Return: void
    */
    checkForSizeChange(){
        let zoomIn = USER_INPUT_MANAGER.isActivated("radar_zoom_in");
        let zoomOut = USER_INPUT_MANAGER.isActivated("radar_zoom_out");
        let keysDown = 0;
        keysDown += zoomIn ? 1 : 0;
        keysDown += zoomOut ? 1 : 0;

        // If not pressing 1 key reset
        if (keysDown != 1){
            // Unlock the change lock
            if (this.radarZoomChangeLock.isLocked()){
                this.radarZoomChangeLock.unlock();
            }
            return;
        }
        // is pressing key

        // if the lock is still locked ignore
        if (this.radarZoomChangeLock.isLocked()){ return; }
        this.radarZoomChangeLock.lock();
        if (zoomIn){
            this.bIndex = Math.max(this.bIndex - 1, 0);
        }else if (zoomOut){
            this.bIndex = Math.min(this.bIndex + 1, PROGRAM_DATA["radar"]["b"].length - 1);
        }
        this.b = PROGRAM_DATA["radar"]["b"][this.bIndex];
    }

    // Abstract
    update(){}
}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = Radar;
}