/*
    Class Name: Menu
    Description: An abstract class for making menus
*/
class Menu {
    /*
        Method Name: constructor
        Method Parameters: None
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(){
        this.visible = false;
        this.components = [];
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Finds the width of the screen and returns it
        Method Return: int
    */
    getWidth(){
        return getScreenWidth();
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Finds the height of the screen and returns it
        Method Return: int
    */
    getHeight(){
        return getScreenHeight();
    }

    /*
        Method Name: makeRectangleWithText
        Method Parameters:
        textStr:
            String of text inside the rectangle
        colour:
            The colour of the rectangle
        textColour:
            The colour of the text insid the rectangle
        x:
            The x location of the top left of the rectangle
        y:
            The y location of the top left of the rectangle
        width:
            The width of the rectangle
        height:
            The height of the rectangle

        Method Description: Create a rectangle with text inside
        Method Return: void
    */
    static makeRectangleWithText(textStr, colour, textColour, x, y, width, height){
        let screenX = x;
        let screenY = menuManager.changeToScreenY(y);

        // Make the rectangle
        fill(colour);
        rect(screenX, screenY, width, height);

        // Make the text
        Menu.makeText(textStr, textColour, x, y, width, height);
    }

    /*
        Method Name: makeText
        Method Parameters:
        textStr:
            String of text inside the rectangle
        textColour:
            The colour of the text insid the rectangle
        x:
            The x location of the top left of the text box
        y:
            The y location of the top left of the text box
        width:
            The width of the text
        height:
            The height of the text

        Method Description: Create text box filled with text
        Method Return: void
    */
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

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display all components
        Method Return: void
    */
    display(){
        for (let component of this.components){
            component.display();
        }
    }

    /*
        Method Name: click
        Method Parameters:
        x:
            The x location of the click
        y:
            The y location of the click

        Method Description: Determine if any component was clicked (from most recently added to least)
        Method Return: void
    */
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