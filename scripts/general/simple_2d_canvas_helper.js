// Note: I originally used p5 for this project. I realized after a few months it was unnecessary so I created this to replace it.
const LEFT = "left";
const TOP = "top";
const BOTTOM = "bottom";
const RIGHT = "right";
const CENTER = "center";

/*
    Class Name: TODO
    Description: TODO
*/
class Colour {
    constructor(r,g,b,a=1){
        this.red = r;
        this.green = g;
        this.blue = b;
        this.alpha = a;
    }

    /*
        Method Name: constructor
        Method Parameters:
            multiplier:
                TODO
        Method Description: Constructor
        Method Return: Constructor
    */
    modifyBrightness(multiplier){
        this.red = Math.min(255, this.red * multiplier);
        this.green = Math.min(255, this.green * multiplier);
        this.blue = Math.min(255, this.blue * multiplier);
    }

    /*
        Method Name: TODO
        Method Parameters:
            TODO:
                TODO
        Method Description: TODO
        Method Return: TODO
    */
    setAlpha(newAlphaValue){
        this.alpha = newAlphaValue;
    }


    toString(){
        return `rgba(${this.red},${this.green},${this.blue},${this.alpha})`
    }

    /*
        Method Name: TODO
        Method Parameters:
            TODO:
                TODO
        Method Description: TODO
        Method Return: TODO
    */
    static fromCode(code){
        let red = Number("0x" + code.charAt(1) + code.charAt(2));
        let green = Number("0x" + code.charAt(3) + code.charAt(4));
        let blue = Number("0x" + code.charAt(5) + code.charAt(6));
        return new Colour(red, green, blue);
    }
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function translate(x, y){
    drawingContext.translate(x,y);
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function rotate(rads){
    drawingContext.rotate(rads);
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function scale(x, y){
    drawingContext.scale(x,y);
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function strokeRectangle(colourObject, x, y, width, height){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.rect(x, y, width, height);
    drawingContext.strokeRect(x, y, width, height);
    drawingContext.fill();
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function noStrokeRectangle(colourObject, x, y, width, height){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.rect(x, y, width, height);
    drawingContext.fill();
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function strokeCircle(colourObject, x, y, diameter){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.arc(x, y, diameter/2, 0, 2 * Math.PI);
    drawingContext.strokeArc(x, y, width, height);
    drawingContext.fill();
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function noStrokeCircle(colourObject, x, y, diameter){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.arc(x, y, diameter/2, 0, 2 * Math.PI);
    drawingContext.fill();
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function updateFontSize(newTextSize){
    drawingContext.font = newTextSize.toString() + "px " + PROGRAM_DATA["ui"]["font_family"];
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function measureTextWidth(line){
    return drawingContext.measureText(line).width;
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function updateFillColour(colourObject){
    drawingContext.fillStyle = colourObject.toString();
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function makeText(textStr, screenX, screenY, boxWidth, boxHeight, textColour, textSize, alignLR, alignTB){
    updateFontSize(textSize);
    updateFillColour(textColour);
    let currentSpaceOccupied = textSize;
    drawingContext.textAlign = alignLR;
    drawingContext.textBaseline = alignTB;
    let lines = textStr.split("\n");
    // Display line by line
    let i = 0;
    for (let line of lines){
        drawingContext.fillText(line, screenX, screenY+textSize * i, boxWidth);
        currentSpaceOccupied += textSize;
        i++;
        // Stop once reached limit much
        if (currentSpaceOccupied > boxHeight){
            break;
        }
    }
}

/*
    Method Name: TODO
    Method Parameters:
        TODO:
            TODO
    Method Description: TODO
    Method Return: TODO
*/
function displayImage(image, x, y){
    drawingContext.drawImage(image, x, y);
}