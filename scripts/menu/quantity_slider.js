// TODO: Comments
class QuantitySlider extends Component {
    constructor(x, y, width, height, getValueFunction, setValueFunction, minValue, maxValue, usingFloat=false, backgroundBarColour="black", sliderColour="white", textColour="black"){
        /*
            Use click already built in mechanism to achivate modify mode
            Display as tick each time if keyisdown leftclick then check mousex and mousey and update value and position and if 
            not down then disable edit mode
        */
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

    updateSliderX(){
        let currentValue = this.accessValue();
        let currentPercentage = (currentValue - this.minValue) / (this.maxValue - this.minValue);
        let pxToMove = this.width - this.sliderWidth;
        // this.getX() + Math.floor(this.sliderWidth * ((startingValue-minValue) / (maxValue-minValue)));
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

    display(){
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

    isSliding(){
        return this.sliding;
    }

    tick(){
        let hasMouseOnY = this.coveredByY(MENU_MANAGER.changeFromScreenY(window.mouseY));
        let hasMouseOn = this.covers(window.mouseX, MENU_MANAGER.changeFromScreenY(window.mouseY));
        let activated = USER_INPUT_MANAGER.isActivated("quantity_slider_grab");
        if (this.isSliding() && (!activated || !hasMouseOnY)){
            this.sliding = false;
            return;
        }else if (!this.isSliding() && activated && hasMouseOn){
            this.sliding = true;
        }
        if (!this.isSliding()){ return; }
        // Sliding
        this.moveToX(window.mouseX);
    }

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

    accessValue(){
        return this.getValueFunction();
    }

    modifyValue(newValue){
        return this.setValueFunction(newValue);
    }

    covers(x, y){
        return this.coveredByX(x) && this.coveredByY(y);
    }

    coveredByY(y){
        return y <= this.getY() - this.height && y >= this.getY() - 2 * this.height;
    }

    coveredByX(x){
        return x >= this.getX() && x <= this.getX() + this.width;
    }
}