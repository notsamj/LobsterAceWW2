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
        let x = this.getX();
        let width = this.getWidth();
        let lowerX = x - width / 2;
        let higherX = x + width / 2;
        let withinX = (lowerX >= lX && lowerX <= rX) || (higherX >= lX && higherX <= rX);
        
        let y = this.getY();
        let height = this.getHeight();
        let lowerY = y - height / 2;
        let higherY = y + height / 2;
        let withinY = (lowerY >= bY && lowerY <= tY) || (higherY >= bY && higherY <= tY);
        return withinX && withinY;
    }

    delete(){
        scene.delete(this.id);
    }

    // Abstract Methods
    getWidth(){}
    getHeight(){}
    getImage(){}
    tick(){}
}