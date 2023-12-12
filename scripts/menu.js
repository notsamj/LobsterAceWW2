class Menu {
    constructor(){
        this.visible = false;
        this.components = [];
    }

    static makeRectangleWithText(textStr, colour, textColour, x, y, width, height){
        let screenX = x;
        let screenY = menuManager.changeToScreenY(y);

        // Make the rectangle
        fill(colour);
        rect(screenX, screenY, width, height);

        // Make the text
        Menu.makeText(textStr, textColour, x, y, width, height);
    }

    static makeText(textStr, textColour, x, y, width, height){
        let textLength = 0;
        let splitByLine = textStr.split("\n");
        for (let line of splitByLine){
            textLength = Math.max(textLength, line.length);
        }
        let numLines = splitByLine.length;
        if (textLength == 0){ return; }
        let screenX = x;
        let screenY = menuManager.changeToScreenY(y);
        let maxTextSizeW = Math.floor(width / textLength);
        let maxTextSizeH = Math.floor(height / numLines);
        let calculatedTextSize = Math.min(maxTextSizeW, maxTextSizeH);
        calculatedTextSize = Math.max(calculatedTextSize, 1);
        textSize(calculatedTextSize);
        fill(textColour);
        textAlign(CENTER, CENTER);
        text(textStr, screenX, screenY, width, height);
    }

    display(){
        for (let component of this.components){
            component.display();
        }
    }

    click(x, y){
        for (let i = this.components.length - 1; i >= 0; i--){
            let component = this.components[i];
            if (component.covers(x, y)){
                component.clicked(this);
                break;
            }
        }
    }
}