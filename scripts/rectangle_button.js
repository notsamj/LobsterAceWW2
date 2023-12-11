class RectangleButton {
    constructor(textStr, colour, textColour, x, y, width, height, callBack){
        this.textStr = textStr;
        this.colour = colour;
        this.textColour = textColour;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.callBack = callBack;
    }

    display(){
        Menu.makeRectangleWithText(this.textStr, this.colour, this.textColour, this.x, this.y, this.width, this.height);
    }

    covers(x, y){
        return x >= this.x && x <= this.x + this.width && y <= this.y && y >= this.y - this.height;
    }

    clicked(instance){
        this.callBack(instance);
    }
}