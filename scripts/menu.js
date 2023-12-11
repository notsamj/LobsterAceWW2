class Menu {
    constructor(){
        this.visible = false;
        this.background = null;
        this.components = [];
    }

    static makeRectangleWithText(textStr, colour, textColour, x, y, width, height){
        let textLength = textStr.length;
        let maxTextSizeW = Math.floor(width / textLength);
        let maxTextSizeH = height;
        let calculatedTextSize = Math.min(maxTextSizeW, maxTextSizeH);
        calculatedTextSize = Math.max(calculatedTextSize, 1);
        let screenX = x;
        let screenY = menuManager.changeToScreenY(y);

        // Make the rectangle
        fill(colour);
        rect(screenX, screenY, width, height);

        // Make the text
        textSize(calculatedTextSize);
        fill(textColour);
        textAlign(CENTER, CENTER);
        text(textStr, screenX, screenY, width, height);
    }

    hasBackground(){ return this.background != null; }

    display(){
        if (this.hasBackground()){
            drawingContext.drawImage(this.background, 0, 0);
        }

        for (let component of this.components){
            component.display();
        }
    }

    click(x, y){
        for (let component of this.components){
            if (component.covers(x, y)){
                component.clicked(this);
                break;
            }
        }
    }
}