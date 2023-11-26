class Entity{
    constructor(){
        this.id = null;
        this.x = null;
        this.y = null;
    }

    setX(x){
        this.setCenterX(x);
    }

    setY(y){
        this.setCenterY(y);
    }

    setCenterX(x){
        this.x = x;
    }

    setCenterY(y){
        this.y = y;
    }

    setID(id){
        this.id = id;
    }

    getID(){
        return this.id;
    }

    getX(){
        return this.getCenterX();
    }

    getCenterX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    getCenterY(){
        return this.y;
    }

    touchesRegion(lX, rX, bY, tY){
        return true; // TODO:
    }

    // Abstract Methods
    getWidth(){}
    getHeight(){}
    getImage(){}
}