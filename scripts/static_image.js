/*
    Class Name: StaticImage
    Description: A subclass of Component. An image that does not move.
*/
class StaticImage extends Component {
    /*
        Method Name: constructor
        Method Parameters:
            image:
                An image
            x:
                The x location of the top left corner
            y:
                The y location of the top left corner
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(image, x, y){
        super();
        this.image = image;
        this.x = x;
        this.y = y;
        this.onClick = null;
    }

    // TODO: Comments
    getX(){
        return this.x(getScreenWidth());
    }

    // TODO: Comments
    getY(){
        return this.y(getScreenHeight());
    }

    /*
        Method Name: getWidth
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getWidth(){
        return this.image.width;
    }

    /*
        Method Name: getHeight
        Method Parameters: None
        Method Description: Getter
        Method Return: int
    */
    getHeight(){
        return this.image.height;
    }

    /*
        Method Name: setImage
        Method Parameters:
            image:
                An image
        Method Description: Setter
        Method Return: void
    */
    setImage(image){
        this.image = image;
    }

    /*
        Method Name: setX
        Method Parameters:
            x:
                The x location of the top left corner
        Method Description: Setter
        Method Return: void
    */
    setX(x){
        this.x = x;
    }

    /*
        Method Name: setY
        Method Parameters:
            y:
                The y location of the top left corner
        Method Description: Setter
        Method Return: void
    */
    setY(y){
        this.y = y;
    }

     /*
        Method Name: getImage
        Method Parameters: None
        Method Description: Getter
        Method Return: Image
    */
    getImage(){
        return this.image;
    }

    /*
        Method Name: display
        Method Parameters: None
        Method Description: Display the image on the screen
        Method Return: void
    */
    display(){
        if (!this.enabled){ return; }
        let screenY = menuManager.changeToScreenY(this.getY());
        drawingContext.drawImage(this.getImage(), this.getX(), screenY);
    }

    /*
        Method Name: covers
        Method Parameters:
            x:
                Screen coordinate x
            y:
                Screen coordinate y
        Method Description: Determines whether the image covers a point on the screen
        Method Return: boolean, true -> covers, false -> does not cover
    */
    covers(x, y){
        return x >= this.getX() && x <= this.getX() + this.image.width && y <= this.getY() && y >= this.getY() - this.image.height;
    }

    /*
        Method Name: setOnClick
        Method Parameters:
            func:
                the function to call when clicked
        Method Description: Setter
        Method Return: void
    */
    setOnClick(func){
        this.onClick = func;
    }

    /*
        Method Name: clicked
        Method Parameters: None
        Method Description: Calls the onClick handler function
        Method Return: void
    */
    clicked(){
        if (this.onClick == null){ return; }
        this.onClick();
    }
}