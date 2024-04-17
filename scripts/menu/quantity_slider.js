/*
    Class Name: QuantitySlider
    Description: A type of component. A sliding bar for setting a value.
*/
class QuantitySlider extends Component {
    /*
        Method Name: constructor
        Method Parameters:
            x:
                x location of the quantity slider
            y:
                y location of the quantity slider
            width:
                Width of the quantity slider
            height:
                Height of the quantity slider
            getValueFunction:
                Function to call to get the value
            setValueFunction:
                Function to call to set the value
            minValue:
                Minimum value
            maxValue:
                Maximum value
            usingFloat:
                Whether using floats rather than integers
            backgroundBarColour:
                Colour of the bar background
            sliderColour:
                Colour of the slider
            textColour:
                Colour of the text
        Method Description: Constructor
        Method Return: Constructor
    */
    constructor(x, y, width, height, getValueFunction, setValueFunction, minValue, maxValue, usingFloat=false, backgroundBarColour="black", sliderColour="white", textColour="black"){
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.sliderWidth = PROGRAM_DATA["menu"]["quantity_slider"]["slider_width_px"];
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.getValueFunction = getValueFunction;
        this.updateSliderX();
        this.setValueFunction = setValueFunction;
        this.sliding = false;
        this.usingFloat = usingFloat;
        this.backgroundBarColour = backgroundBarColour;
        this.sliderColour = sliderColour;
        this.textColour = textColour;
    }

    /*
        Method Name: updateSliderX
        Method Parameters: None
        Method Description: Updates the x positition of the slider
        Method Return: void
    */
    updateSliderX(){
        let currentValue = this.accessValue();
        let currentPercentage = (currentValue - this.minValue) / (this.maxValue - this.minValue);
        let pxToMove = this.width - this.sliderWidth;
        this.sliderX = this.getX() + Math.round(currentPercentage * pxToMove);
    }

    /*
        Method Name: getX
        Method Parameters: None
        Method Description: Determines the x value of this component. Depends on whether it is set as a function of the screen dimensions or static.
        Method Return: int
    */
    getX(){
        if (typeof this.x === "function"){
            return this.x(getScreenWidth());
        }else{
            return this.x;
        }
    }

    /*
        Method Name: getY
        Method Parameters: None
        Method Description: Determines the y value of this component. Depends on whether it is set as a function of the screen dimensions or static.
        Method Return: int
    */
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
        Method Description: Displays the quantity slider
        Method Return: void
    */
    display(){
        // Update position and such things
        this.tick();
        
        // Background Rectangle
        let screenYForRects = MENU_MANAGER.changeToScreenY(this.getY()-this.height);
        fill(this.backgroundBarColour);
        rect(this.getX(), screenYForRects, this.width, this.height);
    
        // Slider
        fill(this.sliderColour);
        rect(this.sliderX, screenYForRects, this.sliderWidth, this.height);

        // Text
        Menu.makeText(this.accessValue().toString(), this.textColour, this.getX(), this.getY(), this.width, this.height);
    }

    /*
        Method Name: isSliding
        Method Parameters: None
        Method Description: Checks if the slider is currently sliding
        Method Return: Boolean
    */
    isSliding(){
        return this.sliding;
    }

    /*
        Method Name: tick
        Method Parameters: None
        Method Description: Checks if the slider should move
        Method Return: void
    */
    tick(){
        let hasMouseOnY = this.coveredByY(MENU_MANAGER.changeFromScreenY(window.mouseY));
        let hasMouseOn = this.covers(window.mouseX, MENU_MANAGER.changeFromScreenY(window.mouseY));
        let activated = USER_INPUT_MANAGER.isActivated("quantity_slider_grab");

        // If currently sliding and either the user is not clicking OR mouse if off it in y axis
        if (this.isSliding() && (!activated || !hasMouseOnY)){
            this.sliding = false;
            return;
        }
        // If not currently sliding and clicking and the mouse is fully on the bar
        else if (!this.isSliding() && activated && hasMouseOn){
            this.sliding = true;
        }
        
        // If not sliding at this point don't change anything
        if (!this.isSliding()){ return; }

        // Sliding
        this.moveToX(window.mouseX);
    }

    /*
        Method Name: moveToX
        Method Parameters:
            mouseX:
                Current mosue x position
        Method Description: Move the slider to match the user input
        Method Return: void
    */
    moveToX(mouseX){
        // Update the slider position
        let sliderOffset = mouseX - this.getX() - this.sliderWidth/2;
        // Either set value to extremes or in between
        let calculatedValue = sliderOffset / (this.width - this.sliderWidth) * (this.maxValue - this.minValue) + this.minValue;
        if (!this.usingFloat){
            calculatedValue = Math.floor(calculatedValue);
        }
        let newValue = Math.min(Math.max(calculatedValue, this.minValue), this.maxValue);
        this.modifyValue(newValue);
        this.updateSliderX();
    }

    /*
        Method Name: accessValue
        Method Parameters: None
        Method Description: Access the value of the slider
        Method Return: Number
    */
    accessValue(){
        return this.getValueFunction();
    }

    /*
        Method Name: modifyValue
        Method Parameters:
            newValue:
                A new value after being modified by a slider
        Method Description: Modifies the value associated with the slider
        Method Return: 
    */
    modifyValue(newValue){
        this.setValueFunction(newValue);
    }

    /*
        Method Name: covers
        Method Parameters:
            x:
                An x coordinate
            y:
                A y coordinate
        Method Description: Checks if a given point is covered by the slider
        Method Return: Boolean
    */
    covers(x, y){
        return this.coveredByX(x) && this.coveredByY(y);
    }

    /*
        Method Name: coveredByY
        Method Parameters:
            y:
                A y coordinate
        Method Description: Checks if a given point is covered by the slider's y position
        Method Return: Boolean
    */
    coveredByY(y){
        return y <= this.getY() - this.height && y >= this.getY() - 2 * this.height;
    }

    /*
        Method Name: coveredByX
        Method Parameters:
            x:
                An x coordinate
        Method Description: Checks if a given point is covered by the slider's x position
        Method Return: Boolean
    */
    coveredByX(x){
        return x >= this.getX() && x <= this.getX() + this.width;
    }
}