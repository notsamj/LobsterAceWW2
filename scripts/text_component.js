class TextComponent extends Component {
    constructor(textStr, textColour, x, y, width, height){
        super();
        this.textStr = textStr;
        this.textColour = textColour;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    display(){
        if (!this.enabled){ return; }
        Menu.makeText(this.textStr, this.textColour, this.x, this.y, this.width, this.height);
    }

    setText(str){
        this.textStr = str;
    }
}