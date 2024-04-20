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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(entity){
        this.size = PROGRAM_DATA["radar"]["size"]; // MUST BE EVEN
        this.entity = entity;
        this.blipSize = PROGRAM_DATA["radar"]["blip_size"];
        this.radarOutline = getImage("radar_outline");
        this.distanceMultiplierA = PROGRAM_DATA["radar"]["distance_multiplier_a"];
        this.logConstant = Math.log(PROGRAM_DATA["radar"]["base_distance"]);
        this.borderWidth = PROGRAM_DATA["radar"]["border_width"];
        this.radarData = this.resetRadar();
        
        this.fighterWeight = PROGRAM_DATA["radar"]["fighter_weight"];
        this.bomberWeight = PROGRAM_DATA["radar"]["bomber_weight"];
        this.buildingWeight = PROGRAM_DATA["radar"]["building_weight"];

        this.friendlyFighterColour = PROGRAM_DATA["radar"]["friendly_fighter_colour"];
        this.enemyFighterColour = PROGRAM_DATA["radar"]["enemy_fighter_colour"];
        this.friendlyBomberColour = PROGRAM_DATA["radar"]["friendly_bomber_colour"];
        this.enemyBomberColour = PROGRAM_DATA["radar"]["enemy_bomber_colour"];
        this.buildingColour = PROGRAM_DATA["radar"]["building_colour"];
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
            blipData:
                Data about a blip, JSON Object
            screenX:
                x location to draw the blip
            screenY:
                y location to draw the blip
        Method Description: Draw a blip on the screen
        Method Return: void
    */
    drawBlip(blipData, screenX, screenY){
        let bestBlipObject = null;
        for (let blipObject of blipData){
            if (bestBlipObject == null || bestBlipObject["weight"] < blipObject["weight"]){
                bestBlipObject = blipObject;
            }
        }
        let blipColour = color(bestBlipObject["colour"]);
        fill(blipColour);
        rect(screenX, screenY, this.blipSize, this.blipSize);
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the radar on the screen
        Method Return: void
    */
    display(){
        drawingContext.drawImage(this.radarOutline, this.getScreenX(), this.getScreenY());
        for (let x = 0; x < this.size; x++){
            for (let y = 0; y < this.size; y++){
                if (this.radarData[x][y].length == 0){ continue; }
                this.drawBlip(this.radarData[x][y], this.getScreenX() + this.borderWidth + this.blipSize * x, this.getScreenY() + this.borderWidth + this.blipSize * y);
            }
        }
    }

    /*
        Method Name: resetRadar
        Method Parameters: None
        Method Description: Resets the radar
        Method Return: void
    */
    resetRadar(){
        let array2D = [];
        for (let i = 0; i < this.size; i++){
            let newRow = [];
            for (let j = 0; j < this.size; j++){
                newRow.push([]);
            }
            array2D.push(newRow);
        }
        return array2D;
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

        // If distance is low it's a special case
        if (xDistance == 0 || logX < 0){
            xOffsetAmount = 0;
        }else{
            xOffsetAmount = Math.min(Math.floor(logX / this.logConstant), (this.size - 1)/2);
        }

        // If distance is low it's a special case
        if (yDistance == 0 || logY < 0){
            yOffsetAmount = 0;
        }else{
            yOffsetAmount = Math.min(Math.floor(logY / this.logConstant), (this.size - 1)/2);
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

        // Check position for this colour already
        let alreadyPresent = false;
        for (let blipObject of this.radarData[xI][yI]){
            if (blipObject["colour"] == colour){
                blipObject["weight"] += weight;
                alreadyPresent = true;
                break;
            }
        }
        // If not present already, add
        if (!alreadyPresent){
            this.radarData[xI][yI].push({"colour": colour, "weight": weight});
        }
    }

    // Abstract
    update(){}
}

// If using Node JS -> Export the class
if (typeof window === "undefined"){
    module.exports = Radar;
}