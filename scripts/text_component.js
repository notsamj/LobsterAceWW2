/*
    Class Name: StaticImage
    Description: A subclass of Component. A box of text.
*/
class TextComponent extends Component {
    /*
        Method Name: constructor
        Method Parameters:
            textStr:
                String of text inside the rectangle
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
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(textStr, textColour, x, y, width, height){
        super();
        this.textStr = textStr;
        this.textColour = textColour;
        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;
    }

    // TODO: Comments
    getX(){
        if (typeof this.x === "function"){
            return this.x(getScreenWidth());
        }else{
            return this.x;
        }
    }

    // TODO: Comments
    getY(){
        if (typeof this.y === "function"){
            return this.y(getScreenHeight());
        }else{
            return this.y;
        }
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Displays the text on the screen
        Method Return: void
    */
    display(){
        if (!this.enabled){ return; }
        Menu.makeText(this.textStr, this.textColour, this.getX(), this.getY(), this.width, this.height);
    }

    /*
        Method Name: setText
        Method Parameters: None
        Method Description: Setter
        Method Return: void
    */
    setText(str){
        this.textStr = str;
    }
}