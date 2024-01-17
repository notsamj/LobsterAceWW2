/*
    Class Name: RectangleButton
    Description: A subclass of Component. A rectangular button.
*/
class RectangleButton extends Component {
    /*
        Method Name: constructor
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
            callBack:
                Function to call when clicked on
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(textStr, colour, textColour, x, y, width, height, callBack){
        super();
        this.textStr = textStr;
        this.colour = colour;
        this.textColour = textColour;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.callBack = callBack;
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the rectangle on the screen
        Method Return: void
    */
    display(){
        Menu.makeRectangleWithText(this.textStr, this.colour, this.textColour, this.x, this.y, this.width, this.height);
    }

    /*
        Method Name: covers
        Method Parameters:
            x:
                Screen coordinate x
            y:
                Screen coordinate y
        Method Description: Determines whether the rectangle covers a point on the screen
        Method Return: boolean, true -> covers, false -> does not cover
    */
    covers(x, y){
        return x >= this.x && x <= this.x + this.width && y <= this.y && y >= this.y - this.height;
    }

    /*
        Method Name: clicked
        Method Parameters:
            instance:
                The menu responsible for the click
        Method Description: Handles what occurs when clicked on
        Method Return: void
    */
    clicked(instance){
        this.callBack(instance);
    }
}