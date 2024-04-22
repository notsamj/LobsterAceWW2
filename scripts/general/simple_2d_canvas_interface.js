// Note: I originally used p5 for this project. I realized after a few months it was unnecessary so I created this to replace it.
const LEFT = "left";
const TOP = "top";
const BOTTOM = "bottom";
const RIGHT = "right";
const CENTER = "center";

class Colour {
    constructor(r,g,b,a=1){
        this.red = r;
        this.green = g;
        this.blue = b;
        this.alpha = a;
    }

    modifyBrightness(multiplier){
        this.red = Math.min(255, this.red * multiplier);
        this.green = Math.min(255, this.green * multiplier);
        this.blue = Math.min(255, this.blue * multiplier);
    }

    setAlpha(newAlphaValue){
        this.alpha = newAlphaValue;
    }

    toString(){
        return `rgba(${this.red},${this.green},${this.blue},${this.alpha})`
    }

    static fromCode(code){
        let red = Number("0x" + code.charAt(1) + code.charAt(2));
        let green = Number("0x" + code.charAt(3) + code.charAt(4));
        let blue = Number("0x" + code.charAt(5) + code.charAt(6));
        return new Colour(red, green, blue);
    }
}

function translate(x, y){
    drawingContext.translate(x,y);
}

function rotate(rads){
    drawingContext.rotate(rads);
}

function scale(x, y){
    drawingContext.scale(x,y);
}

function strokeRectangle(colourObject, x, y, width, height){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.rect(x, y, width, height);
    drawingContext.strokeRect(x, y, width, height);
    drawingContext.fill();
}

function noStrokeRectangle(colourObject, x, y, width, height){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.rect(x, y, width, height);
    drawingContext.fill();
}

function strokeCircle(colourObject, x, y, diameter){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.arc(x, y, diameter/2, 0, 2 * Math.PI);
    drawingContext.strokeArc(x, y, width, height);
    drawingContext.fill();
}

function noStrokeCircle(colourObject, x, y, diameter){
    updateFillColour(colourObject);
    drawingContext.beginPath();
    drawingContext.arc(x, y, diameter/2, 0, 2 * Math.PI);
    drawingContext.fill();
}

function updateFontSize(newTextSize){
    drawingContext.font = newTextSize.toString() + "px " + PROGRAM_DATA["ui"]["font_family"];
}

function measureTextWidth(line){
    return drawingContext.measureText(line).width;
}

function updateFillColour(colourObject){
    drawingContext.fillStyle = colourObject.toString();
}

function makeText(textStr, screenX, screenY, boxWidth, boxHeight, textColour, textSize, alignLR, alignTB){
    updateFontSize(textSize);
    updateFillColour(textColour);
    drawingContext.textAlign = alignLR;
    drawingContext.textBaseline = alignTB;
    drawingContext.fillText(textStr, screenX, screenY, boxWidth);
}

function displayImage(image, x, y){
    drawingContext.drawImage(image, x, y);
}