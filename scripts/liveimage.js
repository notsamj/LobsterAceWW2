class LiveImage {
    constructor(url, x=0, y=0){
        this.image = new Image();
        this.image.src = url;
        this.x = x;
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

    setX(x){
        this.x = x;
    }

    setY(y){
        this.y = y;
    }

    getXPixel(){
        return Math.floor(this.getX());
    }

    getYPixel(){
        return Math.floor(this.getY());
    }

    display(){
        drawingContext.drawImage(this.getImage(), this.getXPixel(), this.getYPixel());
    }

    setURL(url){
        this.image.src = url;
    }

    getURL(){
        return this.image.src;
    }

}