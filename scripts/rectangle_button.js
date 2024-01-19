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
                The x location of the top left of the rectangle or a function that returns the x given the screen width
            y:
                The y location of the top left of the rectangle or a function that returns the y given the screen height
            width:
                The width of the rectangle or a function that returns the width given the screen width
            height:
                The height of the rectangle or a function that returns the height given the screen height
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

    // TODO: Comments
    getX(){
        if (typeof this.x === "function"){
            return this.x(window.innerWidth);
        }else{
            return this.x;
        }
    }

    // TODO: Comments
    getY(){
        if (typeof this.y === "function"){
            return this.y(window.innerHeight);
        }else{
            return this.y;
        }
    }

    // TODO: Comments
    getWidth(){
        if (typeof this.width === "function"){
            return this.width(window.innerWidth);
        }else{
            return this.width;
        }
    }

    // TODO: Comments
    getHeight(){
        if (typeof this.height === "function"){
            return this.height(window.innerHeight);
        }else{
            return this.height;
        }
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the rectangle on the screen
        Method Return: void
    */
    display(){
        Menu.makeRectangleWithText(this.textStr, this.colour, this.textColour, this.getX(), this.getY(), this.getWidth(), this.getHeight());
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
        return x >= this.getX() && x <= this.getX() + this.getWidth() && y <= this.getY() && y >= this.getY() - this.getHeight();
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