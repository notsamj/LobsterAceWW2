class StaticImage extends Component {
    constructor(image, x, y){
        super();
        this.image = image;
        this.x = x;
        this.y = y;
        this.onClick = null;
    }

    getWidth(){
        return this.image.width;
    }

    getHeight(){
        return this.image.height;
    }

    setImage(image){
        this.image = image;
    }

    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }

    getImage(){
        return this.image;
    }

    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    display(){
        if (!this.enabled){ return; }
        let screenY = menuManager.changeToScreenY(this.getY());
        drawingContext.drawImage(this.getImage(), this.getX(), screenY);
    }

    covers(x, y){
        return x >= this.x && x <= this.x + this.image.width && y <= this.y && y >= this.y - this.image.height;
    }

    setOnClick(func){
        this.onClick = func;
    }

    clicked(){
        if (this.onClick == null){ return; }
        this.onClick();
    }
}